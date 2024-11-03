pragma solidity ^0.8.13;
import {console} from "forge-std/console.sol";

enum AsyncPromiseState {
    AWAITING_CALLBACK_SELECTOR,
    COMPLETED
}

contract AsyncPromise {
    address public immutable localCaller;
    bytes4 public callbackSelector;
    bytes32 public messageId;
    AsyncPromiseState public state = AsyncPromiseState.AWAITING_CALLBACK_SELECTOR;

    constructor(address _caller, bytes32 _messageId) {
        localCaller = _caller;
        messageId = _messageId;
    }

    fallback() external {
        require(msg.sender == localCaller, "Only the caller can call this function");

        if (state == AsyncPromiseState.COMPLETED) {
            revert("Promise already setup");
        }

        if (state == AsyncPromiseState.AWAITING_CALLBACK_SELECTOR) {
            // TODO: is there a way to confirm in the general case this is ".then"?
            console.log("got callback selector");
            console.logBytes(msg.data);
            // 4 bytes for the outer selector, 20 bytes for the address, 4 bytes for the callback selector
            callbackSelector = bytes4(msg.data[24:28]);
            state = AsyncPromiseState.COMPLETED;
        }
    }
}