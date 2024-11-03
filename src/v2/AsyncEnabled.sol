// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {console} from "forge-std/console.sol";

struct XAddress {
    address addr;
    uint256 chainId;
}

struct AsyncCall {
    XAddress from;
    XAddress to;
    uint256 nonce;
    bytes data;
}

library AsyncRelayerUtils {
    function getAsyncCallRelayer(address _forAddress) public view returns (AsyncCallRelayer) {
        address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            _forAddress,
            bytes32(0),
            keccak256(type(AsyncCallRelayer).creationCode)
        )))));
        return AsyncCallRelayer(predictedAddress);
    }

    function getAsyncCallbackRelayer(address _forAddress) public view returns (AsyncCallbackRelayer) {
        address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            _forAddress,
            bytes32(0),
            keccak256(type(AsyncCallbackRelayer).creationCode)
        )))));
        return AsyncCallbackRelayer(predictedAddress);
    }

    function getRemoteCaller(address _forAddress, uint256 _chainId) public view returns (RemoteCallerProxy) {
        bytes32 salt = keccak256(abi.encodePacked(_forAddress, bytes32(_chainId)));
        return RemoteCallerProxy(address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            _forAddress,
            salt,
            keccak256(type(RemoteCallerProxy).creationCode)
        ))))));
    }
}

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

contract RemoteCallerProxy {
    address public immutable forAddress;

    constructor() {
        forAddress = msg.sender;
    }
}

// assume we have the following contract with an inheritable modifier:
contract AsyncEnabled {
    // TODO: make these private but leaving this for testing purposes
    AsyncCallRelayer public immutable asyncCallRelayer;
    AsyncCallbackRelayer public immutable asyncCallbackRelayer;
    // mapping of address to chainId to remote caller proxy, should also be private
    mapping(address => mapping(uint256 => RemoteCallerProxy)) public remoteCallerProxies;

    function getRemoteInstance(address _remoteInstanceAddress, uint256 _chainId) internal returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(_remoteInstanceAddress, bytes32(_chainId)));
        if (address(remoteCallerProxies[_remoteInstanceAddress][_chainId]) == address(0)) {
            remoteCallerProxies[_remoteInstanceAddress][_chainId] = new RemoteCallerProxy{salt: salt}();
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
