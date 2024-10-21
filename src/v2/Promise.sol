// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Promise {
    bytes4 private callbackFunctionSelector;
    address private callbackContract;

    function then(bytes4 _callbackFunctionSelector) external virtual returns (Promise) {
        // store the callback contract address and function selector
        callbackContract = msg.sender;
        callbackFunctionSelector = _callbackFunctionSelector;
        return this;
    }

    function _executeCallback() internal virtual {
        if (callbackContract != address(0)) {
            (bool success, ) = callbackContract.call(abi.encodeWithSelector(callbackFunctionSelector, msg.data));
            require(success, "Callback execution failed");
        }
    }
}
