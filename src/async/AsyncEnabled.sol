// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {AsyncUtils} from "./AsyncUtils.sol";
import {console} from "forge-std/console.sol";
import {AsyncRemoteProxy} from "./AsyncRemoteProxy.sol";

contract AsyncCallRelayer {
    address public immutable forAddress;

    constructor() {
        forAddress = msg.sender;
    }
}

contract AsyncCallbackRelayer {
    address public immutable forAddress;

    constructor() {
        forAddress = msg.sender;
    }
}

contract AsyncEnabled {
    // TODO: make these private but leaving this for testing purposes
    AsyncCallRelayer public immutable asyncCallRelayer;
    AsyncCallbackRelayer public immutable asyncCallbackRelayer;
    // mapping of address to chainId to remote caller proxy, should also be private
    mapping(address => mapping(uint256 => AsyncRemoteProxy)) public remoteCallerProxies;

    // gets a remote instance of the contract, creating it if it doesn't exist
    function getRemoteInstance(address _remoteInstanceAddress, uint256 _chainId) internal returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(_remoteInstanceAddress, bytes32(_chainId)));
        if (address(remoteCallerProxies[_remoteInstanceAddress][_chainId]) == address(0)) {
            remoteCallerProxies[_remoteInstanceAddress][_chainId] = new AsyncRemoteProxy{salt: bytes32(0)}(_chainId);
        }
        return address(remoteCallerProxies[_remoteInstanceAddress][_chainId]);
    }

    function getRemoteSelf(uint256 _chainId) internal returns (address) {
        return address(getRemoteInstance(address(this), _chainId));
    }

    constructor() {
        asyncCallRelayer = new AsyncCallRelayer{salt: bytes32(0)}();
        asyncCallbackRelayer = new AsyncCallbackRelayer{salt: bytes32(0)}();
    }

    modifier async() {
        // TODO: require msg.sender to be authorized async relayer address
        _;
    }

    modifier asyncCallback() {
        // TODO: require msg.sender to be authorized callback relayer address
        _;
    }
}
