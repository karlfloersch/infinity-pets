// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./SuperchainEnabled.sol";
import { ICrossL2Inbox } from "@contracts-bedrock/L2/interfaces/ICrossL2Inbox.sol";
import { Predeploys } from "@contracts-bedrock/libraries/Predeploys.sol";

contract Counter is SuperchainEnabled {
    uint256 public number;

    event CounterDeployed(uint256 indexed magicNumber, address indexed contractAddress);
    event CounterIncremented(uint256 indexed newValue);

    constructor() {
        emit CounterDeployed(420, address(this));
    }

    /// @notice Sets the number to a new value
    /// @param newNumber The new number to set
    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    /// @notice Increments the number by 1
    function increment() public {
        number++;
        emit CounterIncremented(number);
    }

    /// @notice Retrieves the current value of the counter
    /// @return The current counter value
    function getValue() public view returns (uint256) {
        return number;
    }

    function testEmitRead(ICrossL2Inbox.Identifier calldata _eventId, bytes calldata _eventData) external returns (uint256) {
        ICrossL2Inbox(Predeploys.CROSS_L2_INBOX).validateMessage(_eventId, keccak256(_eventData));
        number += 420;
        return 420;
    }

    /// @notice Sends a cross-chain message to increment the counter on another chain
    /// @param destChainId The destination chain ID
    function sendIncrementToChain(uint256 destChainId) external {
        bytes memory data = abi.encodeWithSelector(this.crossChainIncrement.selector);
        _xMessageSelf(destChainId, data);
    }

    /// @notice Handles incoming cross-chain messages to increment the counter
    function crossChainIncrement() external xOnlyFromSelf {
        number += 10;
        emit CounterIncremented(number);
    }
}
