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
    address public immutable localSenderAddress;
    uint256 public chainId;
    uint256 public nonce = 0;
    mapping(uint256 => AsyncPromise) public promises;

    function getLocalSenderAddress() external view returns (address) {
        return localSenderAddress;
    }

    constructor() {
        localSenderAddress = msg.sender;
    }

    // TODO: initialization auth and/or use CREATE3 library.  This currently risks fallback collision
    function setChainId(uint256 _chainId) external {
        require(msg.sender == localSenderAddress, "Only the forAddress can set the chainId");
        chainId = _chainId;
    }

    fallback(bytes calldata data) external returns (bytes memory) {
        console.log("got into fallback");
        AsyncPromise newPromise = new AsyncPromise(localSenderAddress, data);
        promises[nonce] = newPromise;
        nonce++;
        console.log("made promise", address(newPromise));
        return abi.encodePacked(bytes32(uint256(uint160(address(newPromise)))));
    }
}

enum AsyncPromiseState {
    AWAITING_CALLBACK_SELECTOR,
    COMPLETED
}

contract AsyncPromise {
    address public immutable localCaller;
    bytes4 public callbackSelector;
    bytes public callDataToSend;
    AsyncPromiseState public state = AsyncPromiseState.AWAITING_CALLBACK_SELECTOR;

    constructor(address _caller, bytes memory _callDataToSend) {
        localCaller = _caller;
        callDataToSend = _callDataToSend;
    }

    fallback() external {
        require(msg.sender == localCaller, "Only the caller can call this function");

        if (state == AsyncPromiseState.COMPLETED) {
            revert("Promise already setup");
        }

        if (state == AsyncPromiseState.AWAITING_CALLBACK_SELECTOR) {
            console.log("got callback selector");
            console.logBytes(msg.data);
            // 4 bytes for the outer selector, 20 bytes for the address, 4 bytes for the callback selector
            callbackSelector = bytes4(msg.data[24:28]);
            state = AsyncPromiseState.COMPLETED;
        }
    }
}

// assume we have the following contract with an inheritable modifier:
contract AsyncEnabled {
    // TODO: make these private but leaving this for testing purposes
    AsyncCallRelayer public immutable asyncCallRelayer;
    AsyncCallbackRelayer public immutable asyncCallbackRelayer;
    // mapping of address to chainId to remote caller proxy, should also be private
    mapping(address => mapping(uint256 => RemoteCallerProxy)) public remoteCallerProxies;

    // gets a remote instance of the contract, creating it if it doesn't exist
    function getRemoteInstance(address _remoteInstanceAddress, uint256 _chainId) internal returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(_remoteInstanceAddress, bytes32(_chainId)));
        if (address(remoteCallerProxies[_remoteInstanceAddress][_chainId]) == address(0)) {
            remoteCallerProxies[_remoteInstanceAddress][_chainId] = new RemoteCallerProxy{salt: salt}();
            remoteCallerProxies[_remoteInstanceAddress][_chainId].setChainId(_chainId);
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
