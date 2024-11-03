// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";
import {AsyncEnabled, AsyncCallRelayer, AsyncCallbackRelayer} from "../src/async/AsyncEnabled.sol";
import {AsyncRemoteProxy} from "../src/async/AsyncRemoteProxy.sol";
import {AsyncPromise} from "../src/async/AsyncPromise.sol";
import {AsyncUtils, AsyncCall, XAddress} from "../src/async/AsyncUtils.sol";

import {MyAsyncEnabled, MyAsyncFunction1Promise} from "../src/v2/MyAsyncEnabled.sol";

contract AsyncEnabledTest is Test {
    MyAsyncEnabled public asyncContract;

    function setUp() public {
        asyncContract = new MyAsyncEnabled();
    }

    function test_getAsyncCallRelayer() public {
        AsyncCallRelayer expectedRelayer = AsyncUtils.getAsyncCallRelayer(address(asyncContract));
        assertEq(address(expectedRelayer), address(asyncContract.asyncCallRelayer()));
    }

    function test_getAsyncCallbackRelayer() public {
        AsyncCallbackRelayer expectedRelayer = AsyncUtils.getAsyncCallbackRelayer(address(asyncContract));
        assertEq(address(expectedRelayer), address(asyncContract.asyncCallbackRelayer()));
    }

    function test_spawnRemoteSelf() public {
        uint256 remoteChainId = 420;
        address remoteSelf = address(asyncContract.spawnRemoteSelf(remoteChainId));
        address expectedRemoteSelf = address(AsyncUtils.getRemoteCaller(address(asyncContract), remoteChainId));
        assertEq(remoteSelf, expectedRemoteSelf);

        address remoteSelfAuthorizedCaller = AsyncRemoteProxy(remoteSelf).localSenderAddress();
        assertEq(remoteSelfAuthorizedCaller, address(asyncContract));
    }

    function test_makePromise() public {
        uint256 remoteChainId = 420;
        address myPromise = asyncContract.makeFunc1Promise(remoteChainId);

        bytes memory promisePayload = AsyncPromise(myPromise).callDataToSend();

        assertEq(promisePayload, abi.encodeWithSelector(MyAsyncEnabled.myAsyncFunction1.selector));
    }

    function test_addCallback() public {
        uint256 remoteChainId = 420;
        address myPromise = asyncContract.makeFunc1Callback(remoteChainId);

        bytes4 callbackSelector = AsyncPromise(myPromise).callbackSelector();
        // assert callback selector is func1
        assertEq(callbackSelector, bytes4(MyAsyncEnabled.myCallback1.selector));
    }
}

contract AsyncUtilsTest is Test {
    function test_EncodeAsyncCall() public {
        AsyncCall memory asyncCall = AsyncCall(
            XAddress(address(0x123), 1),
            XAddress(address(0x456), 2),
            42,
            "test data"
        );

        bytes memory encoded = AsyncUtils.encodeAsyncCall(asyncCall);
        bytes memory expected = abi.encode(
            address(0x123),
            uint256(1),
            address(0x456),
            uint256(2),
            uint256(42),
            bytes("test data")
        );

        assertEq(encoded, expected, "Encoded data does not match expected value");
    }

    function test_DecodeAsyncCall() public {
        bytes memory data = abi.encode(
            address(0x123),
            uint256(1),
            address(0x456),
            uint256(2),
            uint256(42),
            bytes("test data")
        );

        AsyncCall memory asyncCall = AsyncUtils.decodeAsyncCall(data);

        assertEq(asyncCall.from.addr, address(0x123), "From address does not match");
        assertEq(asyncCall.from.chainId, 1, "From chainId does not match");
        assertEq(asyncCall.to.addr, address(0x456), "To address does not match");
        assertEq(asyncCall.to.chainId, 2, "To chainId does not match");
        assertEq(asyncCall.nonce, 42, "Nonce does not match");
        assertEq(asyncCall.data, bytes("test data"), "Data does not match");
    }

    function test_GetAsyncCallId() public {
        AsyncCall memory asyncCall = AsyncCall(
            XAddress(address(0x123), 1),
            XAddress(address(0x456), 2),
            42,
            "test data"
        );

        bytes32 id = AsyncUtils.getAsyncCallId(asyncCall);
        bytes32 expectedId = keccak256(abi.encode(
            address(0x123),
            uint256(1),
            address(0x456),
            uint256(2),
            uint256(42),
            bytes("test data")
        ));

        assertEq(id, expectedId, "AsyncCall ID does not match expected value");
    }
}