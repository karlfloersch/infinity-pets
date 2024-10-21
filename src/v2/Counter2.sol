// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./SuperchainEnabled2.sol";
import "./Promise.sol";
import { ICrossL2Inbox } from "@contracts-bedrock/L2/interfaces/ICrossL2Inbox.sol";
import { Predeploys } from "@contracts-bedrock/libraries/Predeploys.sol";

contract CounterPromise is Promise {
    struct Input {
        uint256 counter;
        string message;
    }

    Input public input;

    constructor(Input memory _input) {
        input = _input;
    }
}

contract Counter2 is SuperchainEnabled2 {
    uint256 public number;
    Counter2 public remoteCounter;

    event CounterDeployed(uint256 indexed magicNumber, address indexed contractAddress);
    event CounterIncremented(uint256 indexed newValue);
    event RemoteCounterUpdated(uint256 counter, string message);

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

    function ingestRemoteCounter(CounterPromise.Input memory input) external {
        number += input.counter;
        emit RemoteCounterUpdated(input.counter, input.message);
    }


    function sendIncrementToChain(uint256 destChainId) external {
        remoteCounter = Counter2(getRemote(destChainId, address(this)));

        // app store can be backed into the SuperchainEnabled lib
        // remoteCounter = Counter2(getRemote(destChainId, "UniswapRouter"));

        CounterPromise p = remoteCounter.crossChainIncrement();
        p.then(this.ingestRemoteCounter.selector);
    }

    // The `async` modifier indicates to the linter that the return value should be a promise
    function crossChainIncrement() external async returns (CounterPromise) {
        (uint256 chainId, address contractAddr) = getXSender();
        require(chainId != block.chainid, "Invalid sender");
        require(contractAddr == address(this), "Invalid sender");
        number += 10;
        emit CounterIncremented(number);
        return new CounterPromise(CounterPromise.Input({
            counter: number,
            message: "Hello world"
        }));
    }
}
