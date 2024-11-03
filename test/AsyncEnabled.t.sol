// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";
import {AsyncEnabled, AsyncCallRelayer, AsyncCallbackRelayer, AsyncUtils} from "../src/async/AsyncEnabled.sol";
import {AsyncRemoteProxy} from "../src/async/AsyncRemoteProxy.sol";
import {AsyncPromise} from "../src/async/AsyncPromise.sol";

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
