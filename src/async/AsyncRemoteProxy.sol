pragma solidity ^0.8.13;
import {console} from "forge-std/console.sol";
import {AsyncPromise} from "./AsyncPromise.sol";
import {AsyncUtils, AsyncCall, XAddress} from "./AsyncUtils.sol";

contract AsyncRemoteProxy {
    address public immutable remoteAddress;
    uint256 public chainId;
    uint256 public nonce = 0;
    mapping(uint256 => AsyncPromise) public promisesByNonce;
    mapping(bytes32 => AsyncPromise) public promisesById;

    function getRemoteAddress() external view returns (address) {
        return remoteAddress;
    }

    constructor() {
        remoteAddress = msg.sender;
    }

    // TODO: move chainID into the contstructor to prevent collision
    function setChainId(uint256 _chainId) external {
        chainId = _chainId;
    }

    fallback(bytes calldata data) external returns (bytes memory) {
        console.log("got into fallback");

        AsyncCall memory asyncCall = AsyncCall(
            XAddress(remoteAddress, block.chainid), // remoteAddress could become msg.sender in future
            XAddress(remoteAddress, chainId),
            nonce,
            data
        );

        bytes32 callId = AsyncUtils.getAsyncCallId(asyncCall);

        AsyncPromise newPromise = new AsyncPromise(remoteAddress, callId);
        promisesByNonce[nonce] = newPromise;
        promisesById[callId] = newPromise;
        nonce++;
        console.log("made promise", address(newPromise));
        return abi.encodePacked(bytes32(uint256(uint160(address(newPromise)))));
    }
}