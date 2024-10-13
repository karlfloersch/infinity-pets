import { Address, TransactionReceipt, Abi } from 'viem';
import { getXContract } from '../contractFactory';

import { abi as routerAbi, bytecode as routerBytecode } from '../../../../out/Router.sol/Router.json'

export class RouterContract {
  private routerContract;

  constructor(chainId: number) {
    this.routerContract = getXContract(chainId, routerAbi as Abi, routerBytecode.object as `0x${string}`);
  }

  async deployRouterContract(): Promise<{ contractAddress: Address; receipt: TransactionReceipt }> {
    console.debug('Deploying Router contract');
    return this.routerContract.deploy();
  }

  async addNewChain(): Promise<TransactionReceipt> {
    console.debug('Adding new chain');
    return this.routerContract.sendTx('addNewChain');
  }

  async isChainDiscoverable(chainId: number): Promise<boolean> {
    return this.routerContract.call('isChainDiscoverable', [chainId]);
  }

  async getDiscoverableChains(): Promise<number[]> {
    const chains = await this.routerContract.call('getDiscoverableChains');
    return chains.map((chain: bigint) => Number(chain));
  }

  async isRouterContractDeployed(): Promise<boolean> {
    return this.routerContract.isDeployed();
  }

  getRouterAddress(): Address {
    return this.routerContract.address;
  }
}

