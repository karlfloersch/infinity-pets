import { Address, TransactionReceipt, concat } from 'viem'
import { COUNTER_ABI, COUNTER_BYTECODE } from '../constants'
import { getXContract } from './contractFactory'
import { EventEntry } from '../state/CounterState'
import { Log } from 'viem'
import { getClient } from './wallet'

export class CounterContract {
  private counterContract;
  private chainId: number;

  constructor(chainId: number) {
    this.chainId = chainId;
    this.counterContract = getXContract(chainId, COUNTER_ABI, COUNTER_BYTECODE);
  }

  // Function to deploy the Counter contract
  async deployCounterContract(): Promise<{ contractAddress: Address; receipt: TransactionReceipt }> {
    console.debug('Deploying Counter contract')
    return this.counterContract.deploy()
  }

  // Function to increment the counter
  async incrementCounter(): Promise<TransactionReceipt> {
    console.debug('Incrementing counter')
    return this.counterContract.sendTx('increment')
  }

  // Function to get the counter value
  async getCounterValue(): Promise<number> {
    const value = await this.counterContract.call('getValue') as bigint
    console.debug('Current counter value:', Number(value))
    return Number(value)
  }

  // Function to check if the Counter contract is deployed
  async isCounterContractDeployed(): Promise<boolean> {
    return this.counterContract.isDeployed()
  }

  // Function to get the Counter contract address
  getCounterAddress(): Address {
    return this.counterContract.address
  }

  // Function to test emit read
  async testEmitRead(eventEntry: EventEntry): Promise<TransactionReceipt> {
    const eventId = {
      origin: eventEntry.log.address,
      blockNumber: eventEntry.log.blockNumber,
      logIndex: BigInt(eventEntry.log.logIndex ?? 0),
      timestamp: eventEntry.timestamp,
      chainId: BigInt(eventEntry.chainId)
    }

    const eventData = concat([...eventEntry.log.topics, eventEntry.log.data])

    console.debug('Calling testEmitRead with:', { eventId, eventData })

    return this.counterContract.sendTx('testEmitRead', [eventId, eventData])
  }

  // Function to watch for counter events
  watchCounterEvents(onEvent: (eventEntry: EventEntry) => void): () => void {
    const { publicClient } = getClient(this.chainId)
    const counterAddress = this.getCounterAddress()

    const unwatch = publicClient.watchContractEvent({
      address: counterAddress,
      abi: COUNTER_ABI,
      fromBlock: 0n,
      onLogs: async (logs: Log[]) => {
        for (const log of logs) {
          if (log.blockNumber) {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
            const eventEntry: EventEntry = {
              log,
              chainId: publicClient.chain?.id ?? 0,
              timestamp: block.timestamp
            };
            onEvent(eventEntry);
          } else {
            console.warn('Event received without block number:', log);
          }
        }
      },
    });
    return unwatch;
  }
}
