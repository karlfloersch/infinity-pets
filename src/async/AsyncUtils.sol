pragma solidity ^0.8.13;
import {console} from "forge-std/console.sol";
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

struct AsyncCallback {
    bytes32 asyncCallId;
    bool success;
    bytes returnData;
}

library AsyncUtils {
    function calculateRemoteProxyAddress(address _localAddress, address _remoteAddress, uint256 _chainId) internal pure returns (AsyncRemoteProxy) {
        return AsyncRemoteProxy(address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            _localAddress,
            bytes32(0),
            keccak256(
                abi.encodePacked(
                    type(AsyncRemoteProxy).creationCode,
                    abi.encode(_remoteAddress, _chainId)
                )
            )
        ))))));
    }

    function encodeAsyncCall(AsyncCall memory asyncCall) internal pure returns (bytes memory) {
        return abi.encode(
            asyncCall.from.addr,
            asyncCall.from.chainId,
            asyncCall.to.addr,
            asyncCall.to.chainId,
            asyncCall.nonce,
            asyncCall.data
        );
    }

    function decodeAsyncCall(bytes memory data) internal pure returns (AsyncCall memory) {
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

    function getAsyncCallId(AsyncCall memory asyncCall) internal pure returns (bytes32) {
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
