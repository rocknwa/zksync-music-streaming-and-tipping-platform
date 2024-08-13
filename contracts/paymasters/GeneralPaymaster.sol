// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import interfaces and libraries from the zkSync contracts
import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol";
import {IPaymasterFlow} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol";
import {TransactionHelper, Transaction} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";

// Import constants from the zkSync contracts
import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

// Import the Ownable contract from OpenZeppelin to provide basic authorization control
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title GeneralPaymaster Contract
/// @notice This contract implements a general paymaster for zkSync without any additional validations.
/// @dev This contract allows paying for transaction fees using the general flow of paymasters.
contract GeneralPaymaster is IPaymaster, Ownable {
    // Modifier to restrict function access to only the bootloader
    modifier onlyBootloader() {
        require(
            msg.sender == BOOTLOADER_FORMAL_ADDRESS, // Ensure the caller is the bootloader
            "Only bootloader can call this method"
        );
        _; // Continue execution if called from the bootloader
    }

    /// @notice Validates and pays for a paymaster transaction
    /// @param _transaction The transaction data
    /// @return magic A magic value indicating success
    /// @return context Additional context data
    function validateAndPayForPaymasterTransaction(
        bytes32,  // Placeholder for a future parameter
        bytes32,  // Placeholder for a future parameter
        Transaction calldata _transaction  // The transaction to be paid for
    )
        external
        payable
        onlyBootloader
        returns (bytes4 magic, bytes memory context)
    {
        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC; // By default, consider the transaction as accepted
        require(
            _transaction.paymasterInput.length >= 4, // Ensure the paymaster input is at least 4 bytes long
            "The standard paymaster input must be at least 4 bytes long"
        );

        bytes4 paymasterInputSelector = bytes4(
            _transaction.paymasterInput[0:4] // Extract the first 4 bytes of the paymaster input
        );
        if (paymasterInputSelector == IPaymasterFlow.general.selector) {
            // Calculate the required ETH to pay for the transaction gas
            uint256 requiredETH = _transaction.gasLimit *
                _transaction.maxFeePerGas;

            // Transfer the required ETH to the bootloader
            (bool success, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{
                value: requiredETH
            }("");
            require(
                success, // Ensure the transfer was successful
                "Failed to transfer tx fee to the Bootloader. Paymaster balance might not be enough."
            );
        } else {
            revert("Unsupported paymaster flow in paymasterParams."); // Revert if the paymaster flow is unsupported
        }
    }

    // Parameters include context, transaction, two 32-byte values (unused), transaction result, and max refunded gas
    /// @notice Handles post-transaction actions
    /// @param _context Additional context data
    /// @param _transaction The transaction data
    /// @param _txResult The execution result of the transaction
    /// @param _maxRefundedGas The maximum gas to be refunded	
    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32,
        bytes32,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    // External function, payable, overrides a function from the inherited interface, restricted to bootloader 
    // This is an empty function body (no additional logic needs to be implemented).   
    ) external payable override onlyBootloader {}

    // Withdraw funds, restricted to the contract owner
    function withdraw(address payable _to) external onlyOwner {
		// Get the contract's current balance
        // HINT: address() can help you get the address of the contract
        uint256 balance = address(this).balance;
        
        // Transfer the balance to the specified address
        (bool success, ) = _to.call{value: balance}("");
        
        // Ensure the transfer was successful
        require(success, "Failed to withdraw funds from paymaster."); 
    }

    receive() external payable {}
}