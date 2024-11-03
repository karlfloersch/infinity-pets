pragma solidity ^0.8.13;
import {console} from "forge-std/console.sol";

enum AsyncPromiseState {
    AWAITING_CALLBACK_SELECTOR,
    COMPLETED
}

contract AsyncPromise {
    address public immutable localInvoker;
    bytes4 public callbackSelector;
    bytes32 public messageId;
    AsyncPromiseState public state = AsyncPromiseState.AWAITING_CALLBACK_SELECTOR;

    constructor(address _invoker, bytes32 _messageId) {
        localInvoker = _invoker;
        messageId = _messageId;
    }

    fallback() external {
        require(msg.sender == localInvoker, "Only the caller can set this promise's callback");

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