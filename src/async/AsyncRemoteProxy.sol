pragma solidity ^0.8.13;
import {console} from "forge-std/console.sol";
import {AsyncPromise} from "./AsyncPromise.sol";

contract AsyncRemoteProxy {
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

    // TODO: move chainID into the contstructor to prevent collision
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