import {
  sendTransaction,
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
  readContract
} from '@wagmi/core'
import { keccak256, bytesToHex, parseGwei } from 'viem' // Import bytesToHex
import {
  wagmiConfig,
  COUNTER_ABI,
  COUNTER_BYTECODE,
  CREATE2_FACTORY_ADDRESS,
} from './constants'

// Generalized function to deploy a contract using the CREATE2 factory
export async function deployCreate2Contract(
  account: `0x${string}`,
  bytecode: `0x${string}`,
  salt: string
): Promise<{ contractAddress: `0x${string}`; receipt: any }> {
  // Convert the salt string to bytes and pad/truncate to 4 bytes
  const encoder = new TextEncoder()
  const saltBytes = encoder.encode(salt)

  if (saltBytes.length > 4) {
    throw new Error('Salt must be at most 4 bytes (4 ASCII characters).')
  }

  const saltPadded = new Uint8Array(4)
  saltPadded.set(saltBytes)

  // Convert the salt bytes to hex
  const functionSelector = '0x' + bytesToHex(saltPadded)

  // Padding of 28 bytes to make up 32 bytes
  const padding = '0x' + '00'.repeat(28)

  // Combine function selector and padding to make the first 32 bytes
  const first32Bytes = functionSelector + padding.slice(2) // Remove '0x' from padding

  // Combine to form calldata: first32Bytes + contract bytecode
  const calldata = first32Bytes + bytecode.slice(2) // Remove '0x' from bytecode

  // Prepare the transaction
  const tx = {
    from: account,
    to: CREATE2_FACTORY_ADDRESS as `0x${string}`,
    data: calldata as `0x${string}`,
    gas: 1000000, 
  }

  // Execute deployment using sendTransaction
  const txHash = await sendTransaction(wagmiConfig, tx)

  // Wait for transaction receipt
  const receipt = await waitForTransactionReceipt(wagmiConfig, {
    hash: txHash,
  })

  // Compute the contract address using CREATE2 formula
  const contractAddress = computeCreate2Address(
    CREATE2_FACTORY_ADDRESS,
    functionSelector as `0x${string}`,
    bytecode
  )

  return { contractAddress: contractAddress as `0x${string}`, receipt }
}

// Helper function to compute the CREATE2 contract address
function computeCreate2Address(
  deployerAddress: `0x${string}`,
  salt: `0x${string}`,
  bytecode: `0x${string}`
): `0x${string}` {
  const create2Inputs = `0xff${deployerAddress.slice(2)}${salt.slice(2)}${keccak256(bytecode).slice(2)}`
  const create2Hash = keccak256(`0x${create2Inputs}`)
  const contractAddress = `0x${create2Hash.slice(-40)}`
  return contractAddress as `0x${string}`
}

// Update deployCounterContract to use deployCreate2Contract
export async function deployCounterContract(
  account: `0x${string}`
): Promise<{ contractAddress: `0x${string}`; receipt: any }> {
  const salt = 'SAP' // Using 'SAP' as the salt
  const bytecode = COUNTER_BYTECODE as `0x${string}`

  // Use the generalized deployCreate2Contract function
  const { contractAddress, receipt } = await deployCreate2Contract(
    account,
    bytecode,
    salt
  )

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
  const value = (await readContract(wagmiConfig, {
    address: counterAddress,
    abi: COUNTER_ABI,
    functionName: 'value',
  })) as bigint

  if (typeof value !== 'bigint') {
    throw new Error('Unexpected return type from contract. Expected bigint.')
  }

  return value
}