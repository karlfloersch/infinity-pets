// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {AsyncCall} from "./AsyncUtils.sol";

contract AsyncCallRelayer {
    address public immutable targetAddress;

    constructor() {
        targetAddress = msg.sender;
    }

    function relayAsyncCall(AsyncCall calldata _asyncCall) external {
        // require xDMsender == AsyncRemoteProxy for source/from targetAddress and local/block.chainid

        (bool success, bytes memory returndata) = targetAddress.call(_asyncCall.data);

        return;
    }
}