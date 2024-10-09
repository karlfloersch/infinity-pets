// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Predeploys } from "@contracts-bedrock/libraries/Predeploys.sol";
import { ICrossL2Inbox } from "@contracts-bedrock/L2/interfaces/ICrossL2Inbox.sol";

contract Counter {
    uint256 public number;
    event CounterDeployed(uint256 indexed magicNumber, address indexed contractAddress);
    event CounterIncremented(uint256 indexed newValue); // New event for increment

    constructor() {
        emit CounterDeployed(420, address(this));
    }

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
        emit CounterIncremented(number); // Emit the event with the new counter value
    }

    // Add getValue function
    function getValue() public view returns (uint256) {
        return number;
    }

    function testEmitRead(ICrossL2Inbox.Identifier calldata _newGameId, bytes calldata _newGameData) external returns (uint256) {
        ICrossL2Inbox(Predeploys.CROSS_L2_INBOX).validateMessage(_newGameId, keccak256(_newGameData));
        return 420;
    }
}
