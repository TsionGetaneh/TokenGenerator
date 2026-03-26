// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenGenerator
 * @dev ERC20 Token with custom owner minting
 */
contract TokenGenerator is ERC20, Ownable {
    /**
     * @dev Constructor that mints the total supply to the specified owner
     * @param name Token name
     * @param symbol Token symbol
     * @param initialSupply Total supply in whole tokens (will be multiplied by 10^decimals)
     * @param tokenOwner Address that will receive all minted tokens and own the contract
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address tokenOwner
    ) ERC20(name, symbol) Ownable(tokenOwner) {
        require(tokenOwner != address(0), "Invalid owner address");
        
        // Mint total supply to the specified owner (not msg.sender)
        _mint(tokenOwner, initialSupply * 10 ** decimals());
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}