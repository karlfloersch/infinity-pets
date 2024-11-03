pragma solidity ^0.8.13;
import {console} from "forge-std/console.sol";
import {AsyncPromise} from "./AsyncPromise.sol";
import {AsyncUtils, AsyncCall, XAddress} from "./AsyncUtils.sol";
import {AsyncCallRelayer} from "./AsyncCallRelayer.sol";
import {SuperchainEnabled} from "../SuperchainEnabled.sol";

// An AsyncRemoteProxy is a local representation of a contract on a remote chain.
// Calling an AsyncRemoteProxy triggers an authenticated call to an async function,
//  on the remote chain and returns a local Promise contract,
//  which will eventually trigger a local callback with the return value of the remote async call.
contract AsyncRemoteProxy is SuperchainEnabled {
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

        AsyncPromise promiseContract = new AsyncPromise(msg.sender, callId);
        promisesByNonce[nonce] = promiseContract;
        promisesById[callId] = promiseContract;
        nonce++;
        console.log("made promise", address(promiseContract));

        uint256 remoteChainId = remoteContract.chainId;
        AsyncCallRelayer remoteCallRelayer = AsyncUtils.getAsyncCallRelayer(remoteContract.addr);
        bytes memory relayPayload = abi.encodeWithSelector(
            AsyncCallRelayer.relayAsyncCall.selector,
            asyncCall
        );

        AsyncUtils.encodeAsyncCall(asyncCall);
        _xMessageContract(
            remoteChainId,
            address(remoteCallRelayer),
            relayPayload
        );

        return abi.encodePacked(bytes32(uint256(uint160(address(promiseContract)))));
    }
}