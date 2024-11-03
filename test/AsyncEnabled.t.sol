// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";
import {AsyncEnabled, RemoteCallerProxy, AsyncCallRelayer, AsyncCallbackRelayer, AsyncRelayerUtils, AsyncPromise} from "../src/v2/AsyncEnabled.sol";
import {MyAsyncEnabled, MyAsyncFunction1Promise} from "../src/v2/MyAsyncEnabled.sol";

contract AsyncEnabledTest is Test {
    MyAsyncEnabled public asyncContract;

    function setUp() public {
        asyncContract = new MyAsyncEnabled();
    }

    function test_getAsyncCallRelayer() public {
        AsyncCallRelayer expectedRelayer = AsyncRelayerUtils.getAsyncCallRelayer(address(asyncContract));
        assertEq(address(expectedRelayer), address(asyncContract.asyncCallRelayer()));
    }

    function test_getAsyncCallbackRelayer() public {
        AsyncCallbackRelayer expectedRelayer = AsyncRelayerUtils.getAsyncCallbackRelayer(address(asyncContract));
        assertEq(address(expectedRelayer), address(asyncContract.asyncCallbackRelayer()));
    }

    function test_spawnRemoteSelf() public {
        uint256 remoteChainId = 420;
        address remoteSelf = address(asyncContract.spawnRemoteSelf(remoteChainId));
        address expectedRemoteSelf = address(AsyncRelayerUtils.getRemoteCaller(address(asyncContract), remoteChainId));
        assertEq(remoteSelf, expectedRemoteSelf);

        address remoteSelfAuthorizedCaller = RemoteCallerProxy(remoteSelf).localSenderAddress();
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

    // function test_Increment() public {
    //     counter.increment();
    //     assertEq(counter.number(), 1);
    // }

    // function testFuzz_SetNumber(uint256 x) public {
    //     counter.setNumber(x);
    //     assertEq(counter.number(), x);
    // }
}
