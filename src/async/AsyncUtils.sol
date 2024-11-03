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
        return AsyncRemoteProxy(address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            _forAddress,
            bytes32(0),
            keccak256(
                abi.encodePacked(
                    type(AsyncRemoteProxy).creationCode,
                    abi.encodePacked(_chainId)
                )
            )
        ))))));
    }

    function encodeAsyncCall(AsyncCall memory asyncCall) public pure returns (bytes memory) {
        return abi.encode(
            asyncCall.from.addr,
            asyncCall.from.chainId,
            asyncCall.to.addr,
            asyncCall.to.chainId,
            asyncCall.nonce,
            asyncCall.data
        );
    }

    function decodeAsyncCall(bytes memory data) public pure returns (AsyncCall memory) {
    (
        address fromAddr,
        uint256 fromChainId,
            address toAddr,
            uint256 toChainId,
            uint256 nonce,
            bytes memory callData
    ) = abi.decode(data, (address, uint256, address, uint256, uint256, bytes));

    return AsyncCall(
        XAddress(fromAddr, fromChainId),
        XAddress(toAddr, toChainId),
        nonce,
        callData
        );
    }

    function getAsyncCallId(AsyncCall memory asyncCall) public pure returns (bytes32) {
        return keccak256(abi.encode(
            asyncCall.from.addr,
            asyncCall.from.chainId,
            asyncCall.to.addr,
            asyncCall.to.chainId,
            asyncCall.nonce,
            asyncCall.data
        ));
    }
}
