// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {Test, console} from "forge-std/Test.sol";

import {AsyncEnabled} from "../async/AsyncEnabled.sol";
import {AsyncRemoteProxy} from "../async/AsyncRemoteProxy.sol";

// and assume that we want to create an async contract as follows:
contract MyAsyncEnabled is AsyncEnabled {
    // remote caller spawner for testing purposes
    function spawnRemoteSelf(uint256 _chainId) external returns (address) {
        address remoteCaller = getRemoteSelf(_chainId);
        return remoteCaller;
    }

    function makeFunc1Promise(uint256 _remoteChainId) external returns (address) {
        RemoteMyAsyncEnabled remoteSelf = RemoteMyAsyncEnabled(getRemoteSelf(_remoteChainId));
        MyAsyncFunction1Promise myPromise = remoteSelf.myAsyncFunction1();
        return address(myPromise);
    }

    function makeFunc1Callback(uint256 _remoteChainId) external returns (address) {
        RemoteMyAsyncEnabled remoteSelf = RemoteMyAsyncEnabled(getRemoteSelf(_remoteChainId));
        MyAsyncFunction1Promise myPromise = remoteSelf.myAsyncFunction1();
        myPromise.then(this.myCallback1);
        return address(myPromise);
    }

    function myAsyncFunction1() external async returns (uint256) {
        return 420;
    }

    function myAsyncFunction2(bool _input) external async returns (bytes32) {
        return bytes32(uint256(0xdeadbeef));
    }

    function myCallback1(uint256 _value) external asyncCallback {
        // ...
        return;
    }

    function myCallback2(bytes32 _value) external asyncCallback {
        // ...
        return;
    }

    function doLoop1(uint256 _remoteChainId) external {
        RemoteMyAsyncEnabled remoteSelf = RemoteMyAsyncEnabled(getRemoteSelf(_remoteChainId));
        remoteSelf.myAsyncFunction1().then(this.myCallback1);
        return;
    }

    function doLoop2(uint256 _remoteChainId) external {
        RemoteMyAsyncEnabled remoteSelf = RemoteMyAsyncEnabled(getRemoteSelf(_remoteChainId));
        remoteSelf.myAsyncFunction2(true).then(this.myCallback2);
        return;
    }
}

// This should generate a new set of "Promified" contracts which look like this:

// MyAsyncFunction1Promise is a promise for the return value of myAsyncFunction1
// .then() will accept a callback that takes the return value of myAsyncFunction1
interface MyAsyncFunction1Promise {
    function then(function(uint256) external) external;
}

interface MyAsyncFunction2Promise {
    function then(function(bytes32) external) external;
}

// RemoteMyAsyncEnabled is the promified version of MyAsyncEnabled
interface RemoteMyAsyncEnabled {
    function myAsyncFunction1() external returns (MyAsyncFunction1Promise);

    // input arguments should remain the same
    function myAsyncFunction2(bool _input) external returns (MyAsyncFunction2Promise);
}
