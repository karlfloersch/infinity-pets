// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Router {
    uint256 public constant INITIAL_CHAIN_ID = 901;
    uint256 public constant MAX_CHAIN_ID = 905;

    mapping(uint256 => bool) public discoverableChains;
    uint256 public nextChainId;

    event ChainAdded(uint256 indexed chainId);

    constructor() {
        require(block.chainid == INITIAL_CHAIN_ID, "Router can only be deployed on the initial chain");
        nextChainId = INITIAL_CHAIN_ID;
        addNewChain();  // Add the initial chain
    }

    function addNewChain() public {
        require(nextChainId <= MAX_CHAIN_ID, "Maximum number of chains reached");
        require(!discoverableChains[nextChainId], "Chain already discoverable");

        discoverableChains[nextChainId] = true;
        emit ChainAdded(nextChainId);
        
        if (nextChainId < MAX_CHAIN_ID) {
            nextChainId++;
        }
    }

    function isChainDiscoverable(uint256 chainId) public view returns (bool) {
        return discoverableChains[chainId];
    }

    function getDiscoverableChains() public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = INITIAL_CHAIN_ID; i <= nextChainId; i++) {
            if (discoverableChains[i]) {
                count++;
            }
        }

        uint256[] memory chains = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = INITIAL_CHAIN_ID; i <= nextChainId; i++) {
            if (discoverableChains[i]) {
                chains[index] = i;
                index++;
            }
        }

        return chains;
    }
}

