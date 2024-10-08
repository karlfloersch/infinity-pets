import { simulateContract, writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
import { parseAbi } from 'viem'
import {
  wagmiConfig,
  COUNTER_ABI,
  COUNTER_BYTECODE,
  CREATE2_FACTORY_ADDRESS,
} from './constants'

// Function to deploy the counter contract
export async function deployCounterContract(
  account: `0x${string}`
): Promise<{ contractAddress: `0x${string}`; receipt: any }> {
  const salt = `0x${'00'.repeat(32)}` as `0x${string}`
  const bytecode = COUNTER_BYTECODE as `0x${string}`
  const abi = parseAbi([
    'function deploy(bytes32 salt, bytes memory bytecode) payable returns (address)',
  ])

  // Simulate deployment
  const { request } = await simulateContract(wagmiConfig, {
    account,
    address: CREATE2_FACTORY_ADDRESS as `0x${string}`,
    abi,
    functionName: 'deploy',
    args: [salt, bytecode],
  })

  // Execute deployment
  const txHash = await writeContract(wagmiConfig, request)

  // Wait for transaction receipt
  const receipt = await waitForTransactionReceipt(wagmiConfig, {
    hash: txHash,
  })

  // Extract the contract address from the receipt
  const contractAddress = receipt.contractAddress as `0x${string}`

  return { contractAddress, receipt }
}

// Function to increment the counter
export async function incrementCounter(
  account: `0x${string}`,
  counterAddress: `0x${string}`
): Promise<{ receipt: any }> {
  // Simulate increment
  const { request } = await simulateContract(wagmiConfig, {
    account,
    address: counterAddress as `0x${string}`,
    abi: COUNTER_ABI,
    functionName: 'increment',
  })

  // Execute increment
  const txHash = await writeContract(wagmiConfig, request)

  // Wait for transaction receipt
  const receipt = await waitForTransactionReceipt(wagmiConfig, {
    hash: txHash,
  })

  return { receipt }
}

// Function to get the counter value
export async function getCounterValue(
  counterAddress: `0x${string}`
): Promise<bigint> {
  const value = await readContract(wagmiConfig, {
    address: counterAddress,
    abi: COUNTER_ABI,
    functionName: 'value',
  }) as bigint

  if (typeof value !== 'bigint') {
    throw new Error('Unexpected return type from contract. Expected bigint.')
  }

  return value
}
