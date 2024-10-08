// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    uint256 public number;
    event CounterDeployed(uint256 indexed magicNumber, address indexed contractAddress);

    constructor() {
        emit CounterDeployed(420, address(this));
    }

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }

    // Add getValue function
    function getValue() public view returns (uint256) {
        return number;
    }
}
