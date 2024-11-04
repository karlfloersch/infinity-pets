// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {AsyncUtils} from "./AsyncUtils.sol";
import {console} from "forge-std/console.sol";
import {AsyncRemoteProxy} from "./AsyncRemoteProxy.sol";

contract AsyncEnabled {
    // mapping of address to chainId to remote caller proxy, should probably be private
    mapping(address => mapping(uint256 => AsyncRemoteProxy)) public remoteCallerProxies;

    // gets a remote instance of the contract, creating it if it doesn't exist
    function getRemoteInstance(address _remoteAddress, uint256 _remoteChainId) internal returns (address) {
        if (address(remoteCallerProxies[_remoteAddress][_remoteChainId]) == address(0)) {
            remoteCallerProxies[_remoteAddress][_remoteChainId] = new AsyncRemoteProxy{salt: bytes32(0)}(_remoteAddress, _remoteChainId);
        }
        return address(remoteCallerProxies[_remoteAddress][_remoteChainId]);
    }

    function getRemoteSelf(uint256 _chainId) internal returns (address) {
        return address(getRemoteInstance(address(this), _chainId));
    }

    constructor() {
        console.log("an asyncEnabled contract was just deployed!");
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
