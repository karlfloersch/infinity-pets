pragma solidity ^0.8.13;
import {console} from "forge-std/console.sol";
import {AsyncCallRelayer, AsyncCallbackRelayer} from "./AsyncEnabled.sol";
import {AsyncRemoteProxy} from "./AsyncRemoteProxy.sol";

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

library AsyncUtils {
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

    function getRemoteCaller(address _forAddress, uint256 _chainId) public view returns (AsyncRemoteProxy) {
        bytes32 salt = keccak256(abi.encodePacked(_forAddress, bytes32(_chainId)));
        return AsyncRemoteProxy(address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            _forAddress,
            salt,
            keccak256(type(AsyncRemoteProxy).creationCode)
        ))))));
    }
}