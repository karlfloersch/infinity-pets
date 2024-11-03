pragma solidity ^0.8.13;
import {console} from "forge-std/console.sol";
import {AsyncPromise} from "./AsyncPromise.sol";
import {AsyncUtils, AsyncCall, XAddress} from "./AsyncUtils.sol";

// An AsyncRemoteProxy is a local representation of a contract on a remote chain.
// Calling an AsyncRemoteProxy triggers an authenticated call to an async function,
//  on the remote chain and returns a local Promise contract,
//  which will eventually trigger a local callback with the return value of the remote async call.
contract AsyncRemoteProxy {
    // address and chainId of the remote contract triggered by calling this local proxy
    XAddress public remoteContract;
    uint256 public chainId;
    uint256 public nonce = 0;
    mapping(uint256 => AsyncPromise) public promisesByNonce;
    mapping(bytes32 => AsyncPromise) public promisesById;

    function getRemoteContract() external view returns (XAddress memory) {
        return remoteContract;
    }

    constructor(uint256 _chainId) {
        remoteContract = XAddress(msg.sender, _chainId);
    }

    fallback(bytes calldata data) external returns (bytes memory) {
        XAddress memory fromContract = XAddress(msg.sender, block.chainid);

        AsyncCall memory asyncCall = AsyncCall(
            fromContract,
            remoteContract,
            nonce,
            data
        );

        bytes32 callId = AsyncUtils.getAsyncCallId(asyncCall);

        AsyncPromise newPromise = new AsyncPromise(msg.sender, callId);
        promisesByNonce[nonce] = newPromise;
        promisesById[callId] = newPromise;
        nonce++;
        console.log("made promise", address(newPromise));
        return abi.encodePacked(bytes32(uint256(uint160(address(newPromise)))));
    }
}