pragma solidity ^0.8.13;
import {console} from "forge-std/console.sol";

enum AsyncPromiseState {
    WAITING_FOR_SET_CALLBACK_SELECTOR,
    WAITING_FOR_CALLBACK_EXECUTION,
    RESOLVED // as-yet unused
}

contract AsyncPromise {
    address public immutable localInvoker;
    address public immutable remoteTarget;
    bool public resolved = false;
    bytes4 public callbackSelector;
    bytes32 public messageId;
    AsyncPromiseState public state = AsyncPromiseState.WAITING_FOR_SET_CALLBACK_SELECTOR;

    constructor(address _invoker, address _remoteTarget, bytes32 _messageId) {
        localInvoker = _invoker;
        remoteTarget = _remoteTarget;
        messageId = _messageId;
    }

    function markResolved() external {
        require(msg.sender == localInvoker, "Only the invoker can mark this promise's callback resolved");
        resolved = true;
    }

    fallback() external {
        require(msg.sender == localInvoker, "Only the caller can set this promise's callback");

        if (state == AsyncPromiseState.WAITING_FOR_CALLBACK_EXECUTION) {
            revert("Promise already setup");
        }

        if (state == AsyncPromiseState.WAITING_FOR_SET_CALLBACK_SELECTOR) {
            // TODO: is there a way to confirm in the general case this is ".then"?
            console.log("got callback selector");
            console.logBytes(msg.data);
            // 4 bytes for the outer selector, 20 bytes for the address, 4 bytes for the callback selector
            // TODO: battle test this against more examples / confirm sufficiently generalized
            callbackSelector = bytes4(msg.data[24:28]);
            state = AsyncPromiseState.WAITING_FOR_CALLBACK_EXECUTION;
        }
    }
}