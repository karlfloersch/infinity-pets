// // SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.8.13;
// import {console} from "forge-std/console.sol";
// import {AsyncCall} from "./AsyncUtils.sol";
// import {XAddress, AsyncUtils} from "./AsyncUtils.sol";
// import {AsyncRemoteProxy} from "./AsyncRemoteProxy.sol";
// import {SuperchainEnabled} from "../SuperchainEnabled.sol";

// contract AsyncCallRelayer is SuperchainEnabled {
//     address public immutable targetAddress;

//     constructor() {
//         targetAddress = msg.sender;
//     }

//     function relayAsyncCall(AsyncCall calldata _asyncCall) external {
//         console.log("in relayAsyncCall, checking validity of CDM");
//         // TODO: require xDMsender == AsyncRemoteProxy for source/from targetAddress and local/block.chainid

//         // ensure this message was sent from the async remote proxy for this relayer's local target and chainId
//         AsyncRemoteProxy expectedCrossDomainSender = AsyncUtils.getRemoteCaller(targetAddress, block.chainid);
//         require(_isValidCrossDomainSender(address(expectedCrossDomainSender)));

//         address myTarget = address(targetAddress);
//         console.log("AsyncCallRelayer on chainId %s relaying async call to %s", block.chainid, myTarget);

//         (bool success, bytes memory returndata) = targetAddress.call(_asyncCall.data);


//         console.log("AsyncCallRelayer relayed, success: %s, returndata: ", success);
//         console.logBytes(returndata);
//         // TODO: initiate callback xDM

//         return;
//     }
// }