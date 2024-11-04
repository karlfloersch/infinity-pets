// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {AsyncUtils, AsyncCall, AsyncCallback, XAddress} from "./AsyncUtils.sol";
import {AsyncRemoteProxy} from "./AsyncRemoteProxy.sol";

contract PublicAsyncUtils {
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