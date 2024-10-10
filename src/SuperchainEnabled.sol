pragma solidity ^0.8.13;

// SuperchainEnabled provides utilities for cross-chain event validation,
// sending messages, and receiving messages with modifiers.

import { IL2ToL2CrossDomainMessenger } from "@contracts-bedrock/L2/interfaces/IL2ToL2CrossDomainMessenger.sol";
import { Predeploys } from "@contracts-bedrock/libraries/Predeploys.sol";

abstract contract SuperchainEnabled {
    // Error definitions
    error CallerNotL2ToL2CrossDomainMessenger();
    error InvalidCrossDomainSender();
    error InvalidSourceChain();

    /// @notice Sends a cross-chain message to a destination address on another chain
    /// @param destChainId The chain ID of the destination chain
    /// @param destAddress The address of the destination contract
    /// @param data The calldata to send to the destination contract
    function sendXMessage(
        uint256 destChainId,
        address destAddress,
        bytes memory data
    ) internal {
        IL2ToL2CrossDomainMessenger(Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER).sendMessage(
            destChainId,
            destAddress,
            data
        );
        // No need to emit an event here, as L2ToL2CrossDomainMessenger already emits a SentMessage event
    }

    /// @notice Modifier to validate messages from a specific address
    /// @param expectedSource The expected source address
    modifier onlyXAddress(address expectedSource) {
        if (msg.sender != Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER) {
            revert CallerNotL2ToL2CrossDomainMessenger();
        }
        if (IL2ToL2CrossDomainMessenger(Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER).crossDomainMessageSender() != expectedSource) {
            revert InvalidCrossDomainSender();
        }
        _;
    }

    /// @notice Modifier to validate messages from a specific address on a specific chain
    /// @param expectedSource The expected source address
    /// @param expectedChainId The expected source chain ID
    modifier onlyXContract(address expectedSource, uint256 expectedChainId) {
        if (msg.sender != Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER) {
            revert CallerNotL2ToL2CrossDomainMessenger();
        }
        if (IL2ToL2CrossDomainMessenger(Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER).crossDomainMessageSender() != expectedSource) {
            revert InvalidCrossDomainSender();
        }
        if (IL2ToL2CrossDomainMessenger(Predeploys.L2_TO_L2_CROSS_DOMAIN_MESSENGER).crossDomainMessageSource() != expectedChainId) {
            revert InvalidSourceChain();
        }
        _;
    }
}
