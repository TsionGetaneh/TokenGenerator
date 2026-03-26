// Wait for DOM and ethers
(function() {
    if (typeof ethers === 'undefined') {
        document.body.innerHTML = '<div style="color:#f87171; text-align:center; padding:2rem; background:rgba(0,0,0,0.8); border-radius:1rem; margin:2rem;"><i class="fas fa-exclamation-triangle"></i> Failed to load ethers.js library. Please check your internet connection and refresh.</div>' + document.body.innerHTML;
        return;
    }

    // CONTRACT DETAILS
    const CONTRACT_ADDRESS = "0xdE17B3C5451c28365f7DFF3210A06ce6391DCC7c";
    const ABI = [
        { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint256", "name": "initialSupply", "type": "uint256" }, { "internalType": "address", "name": "tokenOwner", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" },
        { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "allowance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientAllowance", "type": "error" },
        { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "balance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientBalance", "type": "error" },
        { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" },
        { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" },
        { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
        { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" },
        { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "pure", "type": "function" },
        { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }
    ];

    let provider = null, signer = null, contract = null, userAddress = null;
    let tokenDecimals = 18;
    let tokenSymbol = "", tokenName = "";

    // DOM elements
    const connectBtn = document.getElementById('connectBtn');
    const walletDisplay = document.getElementById('walletAddressDisplay');
    const tokenNameSpan = document.getElementById('tokenName');
    const tokenSymbolSpan = document.getElementById('tokenSymbol');
    const totalSupplySpan = document.getElementById('totalSupply');
    const userBalanceSpan = document.getElementById('userBalance');
    const transferToInput = document.getElementById('transferTo');
    const transferAmountInput = document.getElementById('transferAmount');
    const sendTransferBtn = document.getElementById('sendTransferBtn');
    const transferStatus = document.getElementById('transferStatus');
    const approveSpenderInput = document.getElementById('approveSpender');
    const approveAmountInput = document.getElementById('approveAmount');
    const approveBtn = document.getElementById('approveBtn');
    const approveStatus = document.getElementById('approveStatus');
    const allowanceOwnerInput = document.getElementById('allowanceOwner');
    const allowanceSpenderInput = document.getElementById('allowanceSpender');
    const checkAllowanceBtn = document.getElementById('checkAllowanceBtn');
    const allowanceResultDiv = document.getElementById('allowanceResult');
    const transferFromOwnerInput = document.getElementById('transferFromOwner');
    const transferFromToInput = document.getElementById('transferFromTo');
    const transferFromAmountInput = document.getElementById('transferFromAmount');
    const transferFromBtn = document.getElementById('transferFromBtn');
    const transferFromStatus = document.getElementById('transferFromStatus');
    const addToWalletBtn = document.getElementById('addToWalletBtn');
    const burnAmountInput = document.getElementById('burnAmount');
    const burnBtn = document.getElementById('burnBtn');
    const burnStatus = document.getElementById('burnStatus');

    function shortenAddress(addr) {
        return addr ? addr.slice(0,6)+'...'+addr.slice(-4) : 'Not connected';
    }

    function updateWalletUI() {
        if (userAddress) {
            walletDisplay.innerHTML = `<i class="fas fa-wallet"></i> ${shortenAddress(userAddress)}`;
            connectBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Disconnect';
            connectBtn.classList.add('disconnect-btn');
        } else {
            walletDisplay.innerHTML = '<i class="fas fa-circle-notch"></i> Not connected';
            connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect Wallet';
            connectBtn.classList.remove('disconnect-btn');
        }
    }

    function formatToken(weiValue) {
        return ethers.formatUnits(weiValue || 0, tokenDecimals);
    }

    function parseTokenAmount(amountStr) {
        return ethers.parseUnits(amountStr, tokenDecimals);
    }

    async function updateTokenInfo() {
        if (!contract || !userAddress) return;
        try {
            const name = await contract.name();
            const symbol = await contract.symbol();
            const totalSup = await contract.totalSupply();
            const balance = await contract.balanceOf(userAddress);
            tokenName = name;
            tokenSymbol = symbol;
            tokenNameSpan.innerText = name;
            tokenSymbolSpan.innerText = symbol;
            totalSupplySpan.innerText = formatToken(totalSup);
            userBalanceSpan.innerText = formatToken(balance);
        } catch (err) {
            console.error("Token info error:", err);
            tokenNameSpan.innerText = 'Error';
            tokenSymbolSpan.innerText = 'Error';
            totalSupplySpan.innerText = 'Error';
            userBalanceSpan.innerText = 'Error';
        }
    }

    async function fetchDecimals() {
        try {
            tokenDecimals = await contract.decimals();
        } catch(e) {
            tokenDecimals = 18;
        }
    }

    async function initContract() {
        if (!signer) return null;
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        await fetchDecimals();
        await updateTokenInfo();
        return contract;
    }

    async function connectWallet() {
        if (!window.ethereum) {
            alert("MetaMask not detected! Please install MetaMask extension.");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts.length) throw new Error("No accounts");
            userAddress = accounts[0];
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            await initContract();
            updateWalletUI();

            window.ethereum.on('accountsChanged', (acc) => {
                if (acc.length) {
                    userAddress = acc[0];
                    initContract().then(updateWalletUI);
                } else {
                    disconnectWallet();
                }
            });
            window.ethereum.on('chainChanged', () => window.location.reload());
        } catch (error) {
            console.error(error);
            alert("Connection failed: " + (error.message || "Unknown error"));
        }
    }

    async function disconnectWallet() {
        userAddress = null;
        signer = null;
        contract = null;
        updateWalletUI();
        tokenNameSpan.innerText = '—';
        tokenSymbolSpan.innerText = '—';
        totalSupplySpan.innerText = '—';
        userBalanceSpan.innerText = '—';
        transferStatus.innerHTML = approveStatus.innerHTML = transferFromStatus.innerHTML = burnStatus.innerHTML = '';
        allowanceResultDiv.innerHTML = '—';
    }

    async function handleTransaction(txPromise, statusElement, successMsg) {
        if (!contract || !userAddress) {
            statusElement.innerHTML = '<span style="color:#f87171">⚠️ Wallet not connected</span>';
            return;
        }
        statusElement.innerHTML = '<i class="loading-spinner"></i> Transaction pending...';
        try {
            const tx = await txPromise;
            await tx.wait();
            statusElement.innerHTML = `<span style="color:#4ade80">✅ ${successMsg}</span>`;
            await updateTokenInfo();
            setTimeout(() => {
                if (statusElement.innerHTML.includes(successMsg)) statusElement.innerHTML = '';
            }, 4000);
        } catch (err) {
            console.error(err);
            let reason = err.reason || err.message;
            statusElement.innerHTML = `<span style="color:#f87171">❌ Error: ${reason.slice(0,100)}</span>`;
            setTimeout(() => {
                if (statusElement.innerHTML.includes('Error')) statusElement.innerHTML = '';
            }, 5000);
        }
    }

    async function transferTokens() {
        const to = transferToInput.value.trim();
        const amountRaw = transferAmountInput.value.trim();
        if (!ethers.isAddress(to)) {
            transferStatus.innerHTML = '<span style="color:#f87171">Invalid recipient</span>';
            return;
        }
        if (!amountRaw || parseFloat(amountRaw) <= 0) {
            transferStatus.innerHTML = '<span style="color:#f87171">Invalid amount</span>';
            return;
        }
        try {
            const value = parseTokenAmount(amountRaw);
            await handleTransaction(contract.transfer(to, value), transferStatus, `Transfer ${amountRaw} tokens`);
            transferToInput.value = '';
            transferAmountInput.value = '';
        } catch (err) {
            transferStatus.innerHTML = `<span style="color:#f87171">${err.message}</span>`;
        }
    }

    async function approveSpending() {
        const spender = approveSpenderInput.value.trim();
        const amountRaw = approveAmountInput.value.trim();
        if (!ethers.isAddress(spender)) {
            approveStatus.innerHTML = '<span style="color:#f87171">Invalid spender</span>';
            return;
        }
        if (!amountRaw || parseFloat(amountRaw) <= 0) {
            approveStatus.innerHTML = '<span style="color:#f87171">Invalid amount</span>';
            return;
        }
        try {
            const value = parseTokenAmount(amountRaw);
            await handleTransaction(contract.approve(spender, value), approveStatus, `Approved ${amountRaw} tokens`);
            approveSpenderInput.value = '';
            approveAmountInput.value = '';
        } catch (err) {
            approveStatus.innerHTML = `<span style="color:#f87171">${err.message}</span>`;
        }
    }

    async function checkAllowance() {
        if (!contract) {
            allowanceResultDiv.innerHTML = '<span style="color:#f87171">Connect wallet first</span>';
            return;
        }
        const owner = allowanceOwnerInput.value.trim();
        const spender = allowanceSpenderInput.value.trim();
        if (!ethers.isAddress(owner)) {
            allowanceResultDiv.innerHTML = '❌ Invalid owner';
            return;
        }
        if (!ethers.isAddress(spender)) {
            allowanceResultDiv.innerHTML = '❌ Invalid spender';
            return;
        }
        try {
            const allowanceWei = await contract.allowance(owner, spender);
            allowanceResultDiv.innerHTML = `💰 Allowance: ${formatToken(allowanceWei)} ${tokenSymbolSpan.innerText || 'tokens'}`;
        } catch (err) {
            allowanceResultDiv.innerHTML = `⚠️ Error: ${err.message.slice(0,60)}`;
        }
    }

    async function transferFrom() {
        if (!contract) {
            transferFromStatus.innerHTML = '<span style="color:#f87171">Wallet not connected</span>';
            return;
        }
        const fromAddr = transferFromOwnerInput.value.trim();
        const toAddr = transferFromToInput.value.trim();
        const amountRaw = transferFromAmountInput.value.trim();
        if (!ethers.isAddress(fromAddr) || !ethers.isAddress(toAddr)) {
            transferFromStatus.innerHTML = 'Invalid address';
            return;
        }
        if (!amountRaw || parseFloat(amountRaw) <= 0) {
            transferFromStatus.innerHTML = 'Invalid amount';
            return;
        }
        try {
            const value = parseTokenAmount(amountRaw);
            await handleTransaction(contract.transferFrom(fromAddr, toAddr, value), transferFromStatus, `TransferFrom ${amountRaw} tokens`);
            transferFromOwnerInput.value = '';
            transferFromToInput.value = '';
            transferFromAmountInput.value = '';
        } catch (err) {
            transferFromStatus.innerHTML = `<span style="color:#f87171">${err.message}</span>`;
        }
    }

    // Add token to MetaMask
    async function addTokenToWallet() {
        if (!window.ethereum) {
            alert("MetaMask is not installed.");
            return;
        }
        if (!contract) {
            alert("Please connect your wallet first.");
            return;
        }

        // Ensure we have token details
        if (!tokenSymbol || tokenSymbol === '—') {
            try {
                const symbol = await contract.symbol();
                const name = await contract.name();
                const decimals = await contract.decimals();
                tokenSymbol = symbol;
                tokenName = name;
                tokenDecimals = decimals;
                tokenNameSpan.innerText = name;
                tokenSymbolSpan.innerText = symbol;
            } catch (e) {
                alert("Could not fetch token details. Make sure you're on the correct network and the contract exists.");
                return;
            }
        }

        try {
            const wasAdded = await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: CONTRACT_ADDRESS,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                    },
                },
            });
            if (wasAdded) {
                alert("Token added to MetaMask!");
                const originalText = addToWalletBtn.innerHTML;
                addToWalletBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
                setTimeout(() => { addToWalletBtn.innerHTML = originalText; }, 2000);
            } else {
                alert("User declined to add token.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to add token: " + (err.message || "Unknown error"));
        }
    }

    async function burnTokens() {
        if (!contract) {
            burnStatus.innerHTML = '<span style="color:#f87171">Wallet not connected</span>';
            return;
        }
        const amountRaw = burnAmountInput.value.trim();
        if (!amountRaw || parseFloat(amountRaw) <= 0) {
            burnStatus.innerHTML = '<span style="color:#f87171">Invalid amount</span>';
            return;
        }
        try {
            const value = parseTokenAmount(amountRaw);
            if (typeof contract.burn !== 'function') {
                burnStatus.innerHTML = '<span style="color:#f87171">❌ This contract does not have a burn function. Cannot burn tokens.</span>';
                return;
            }
            await handleTransaction(contract.burn(value), burnStatus, `Burned ${amountRaw} tokens`);
            burnAmountInput.value = '';
        } catch (err) {
            burnStatus.innerHTML = `<span style="color:#f87171">${err.message}</span>`;
        }
    }

    // Attach event listeners
    connectBtn.addEventListener('click', () => userAddress ? disconnectWallet() : connectWallet());
    sendTransferBtn.addEventListener('click', transferTokens);
    approveBtn.addEventListener('click', approveSpending);
    checkAllowanceBtn.addEventListener('click', checkAllowance);
    transferFromBtn.addEventListener('click', transferFrom);
    addToWalletBtn.addEventListener('click', addTokenToWallet);
    burnBtn.addEventListener('click', burnTokens);

    // Auto-reconnect if already authorized
    if (window.ethereum && window.ethereum.selectedAddress) {
        window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            if (accounts && accounts.length) connectWallet();
        }).catch(console.warn);
    }
})();