// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";
import {AsyncEnabled, AsyncCallRelayer, AsyncCallbackRelayer, AsyncRelayerUtils} from "../src/v2/AsyncEnabled.sol";
import {MyAsyncEnabled} from "../src/v2/MyAsyncEnabled.sol";

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
