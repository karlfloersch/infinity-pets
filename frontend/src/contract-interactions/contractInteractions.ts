import { Address, TransactionReceipt, concat } from 'viem'
import { COUNTER_ABI, COUNTER_BYTECODE, INITIAL_CHAIN_ID } from '../constants'
import { getXContract } from './contractFactory'
import { EventEntry } from '../state/CounterState'
import { Log } from 'viem'
import { getClient } from './wallet'

const counterContract = getXContract(INITIAL_CHAIN_ID, COUNTER_ABI, COUNTER_BYTECODE)

// Function to deploy the Counter contract
export async function deployCounterContract(): Promise<{ contractAddress: Address; receipt: TransactionReceipt }> {
  console.debug('Deploying Counter contract')
  return counterContract.deploy()
}

// Function to increment the counter
export async function incrementCounter(): Promise<TransactionReceipt> {
  console.debug('Incrementing counter')
  return counterContract.sendTx('increment')
}

// Function to get the counter value
export async function getCounterValue(): Promise<number> {
  const value = await counterContract.call('getValue') as bigint
  console.debug('Current counter value:', Number(value))
  return Number(value)
}

// Function to check if the Counter contract is deployed
export async function isCounterContractDeployed(): Promise<boolean> {
  return counterContract.isDeployed()
}

// Function to get the Counter contract address
export function getCounterAddress(): Address {
  return counterContract.address
}

// Keeping testEmitRead as it was
export async function testEmitRead(
  counterAddress: Address,
  eventEntry: EventEntry
): Promise<TransactionReceipt> {
  const eventId = {
    origin: eventEntry.log.address,
    blockNumber: eventEntry.log.blockNumber,
    logIndex: BigInt(eventEntry.log.logIndex ?? 0),
    timestamp: eventEntry.timestamp,
    chainId: BigInt(eventEntry.chainId)
  }

  const eventData = concat([...eventEntry.log.topics, eventEntry.log.data])

  console.debug('Calling testEmitRead with:', { eventId, eventData })

  return counterContract.sendTx('testEmitRead', [eventId, eventData])
}

// New function to watch for counter events
export function watchCounterEvents(
  chainId: number,
  onEvent: (eventEntry: EventEntry) => void
): () => void {
  const { publicClient } = getClient(chainId)
  const counterAddress = getCounterAddress()

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
