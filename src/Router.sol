// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Router {
    // uint256[] public chainIds = [
    //     11473209,
    //     21473209
    // ];
    uint256[] public chainIds = [
        901,
        902,
        903,
        904,
        905
    ];

    mapping(uint256 => bool) public discoverableChains;
    uint256 public nextChainId = 0;

    event ChainAdded(uint256 indexed chainId);

    constructor() {
        require(block.chainid == chainIds[0], "Router can only be deployed on the initial chain");
        addNewChain();  // Add the initial chain
    }

    function addNewChain() public {
        require(nextChainId < chainIds.length, "Maximum number of chains reached");
        discoverableChains[nextChainId] = true;
        emit ChainAdded(nextChainId);

        nextChainId++;
    }

    function isChainDiscoverable(uint256 chainId) public view returns (bool) {
        return discoverableChains[chainId];
    }

    function getDiscoverableChains() public view returns (uint256[] memory) {
        // Count discoverable chains first
        uint256 count = 0;
        for (uint256 i = 0; i < chainIds.length; i++) {
            if (discoverableChains[i]) {
                count++;
            }
        }

        // Create array of correct size and populate it
        uint256[] memory discoverable = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < chainIds.length; i++) {
            if (discoverableChains[i]) {
                discoverable[index] = chainIds[i];
                index++;
            }
        }

        return discoverable;
    }
}

