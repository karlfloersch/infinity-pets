// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract AsyncCallRelayer {
    address public immutable targetAddress;

    constructor() {
        targetAddress = msg.sender;
    }
}