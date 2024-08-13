// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Imports interfaces and constants related to the Paymaster functionality from zkSync contracts.
import {IPaymaster, ExecutionResult, PAYMASTER_VALIDATION_SUCCESS_MAGIC} 
from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol";

// Imports Paymaster flow interface.
import {IPaymasterFlow} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol";

// Imports transaction helper functions and transaction structure from zkSync contracts.
import {TransactionHelper, Transaction} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";

// Imports various constants used in zkSync.
import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

// Imports Ownable contract from OpenZeppelin, which provides basic authorization control functions.
import "@openzeppelin/contracts/access/Ownable.sol";

// Notice This contract does not include any validations 
// other than using the paymaster general flow

contract GeneralPaymaster is IPaymaster, Ownable {
	
    // Modifier that restricts access to only the bootloader
    modifier onlyBootloader() {
		// Ensure the function is called by the bootloader
        require(
            // ___________ == BOOTLOADER_FORMAL_ADDRESS, // UNCOMMENT_THIS_LINE_AND_FILL_IN_THE_BLANK
            "Only bootloader can call this method"
        );
        
        // Continue execution if the condition is met
        _;
    }

    // Parameters include two 32-byte values (unused) and a transaction.
    function validateAndPayForPaymasterTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    )
        external
        payable
        onlyBootloader
        returns (bytes4 magic, bytes memory context)
    {
        // By default we consider the transaction as accepted
        
        // Set the magic value to indicate a successful validation
        magic = PAYMASTER_VALIDATION_SUCCESS_MAGIC;
        
        // Ensure the paymaster input is at least 4 bytes long.
        require(
            _transaction.paymasterInput.length >= ______, // FILL_IN_THE_BLANK
            "The standard paymaster input must be at least 4 bytes long"
        );
        
		// Extract the first 4 bytes from the paymaster input.
        bytes4 paymasterInputSelector = bytes4(
            _transaction.paymasterInput[0:4]
        );
        
        // Check if the selector matches the general paymaster flow.
        if (paymasterInputSelector == IPaymasterFlow.general.selector) {
        
            // Note, that while the minimal amount of ETH needed is tx.gasPrice * tx.gasLimit,
            // Neither the paymaster nor the account is allowed to access this context variable.
            
            // Calculate the required ETH for the transaction.
            uint256 requiredETH = _transaction.gasLimit * _transaction.maxFeePerGas;

            // The bootloader never returns any data, so it can safely be ignored here.
            // Transfer the required ETH to the bootloader
            (bool success, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{
                value: requiredETH
            }("");
            // Ensure the transfer was successful.
            require(
                success,
                "Failed to transfer tx fee to the Bootloader. Paymaster balance might not be enough."
            );
        // Reverts if the paymaster flow is unsupported.
        } else {
            revert("Unsupported paymaster flow in paymasterParams.");
        }
    }

    // Parameters include context, transaction, two 32-byte values (unused), transaction result, and max refunded gas	
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
        uint256 balance = _________________; // FILL_IN_THE_BLANK
        
        // Transfer the balance to the specified address
        (bool success, ) = _to.call{value: balance}("");
        
        // Ensure the transfer was successful
        require(__________, "Failed to withdraw funds from paymaster."); // FILL_IN_THE_BLANK
    }

    receive() external payable {}
}