// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {AsyncUtils, AsyncCall, AsyncCallback, XAddress} from "./AsyncUtils.sol";
import {AsyncCallbackRelayer} from "./AsyncEnabled.sol";
import {AsyncCallRelayer} from "./AsyncCallRelayer.sol";
import {AsyncRemoteProxy} from "./AsyncRemoteProxy.sol";

contract PublicAsyncUtils {
    function getAsyncCallRelayer(address _forAddress) public view returns (AsyncCallRelayer) {
        return AsyncUtils.getAsyncCallRelayer(_forAddress);
    }

    function getAsyncCallbackRelayer(address _forAddress) public view returns (AsyncCallbackRelayer) {
        return AsyncUtils.getAsyncCallbackRelayer(_forAddress);
    }

    function getRemoteCaller(address _forAddress, uint256 _chainId) public view returns (AsyncRemoteProxy) {
        return AsyncUtils.getRemoteCaller(_forAddress, _chainId);
    }

    function encodeAsyncCall(AsyncCall memory asyncCall) public pure returns (bytes memory) {
        return AsyncUtils.encodeAsyncCall(asyncCall);
    }

    function decodeAsyncCall(bytes memory data) public pure returns (AsyncCall memory) {
        return AsyncUtils.decodeAsyncCall(data);
    }

    function getAsyncCallId(AsyncCall memory asyncCall) public pure returns (bytes32) {
        return AsyncUtils.getAsyncCallId(asyncCall);
    }
}