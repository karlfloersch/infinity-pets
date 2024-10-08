import { keccak256, toHex, TransactionReceipt, getCreate2Address } from 'viem'
import { publicClient, walletClient, CREATE2_FACTORY_ADDRESS, COUNTER_ABI, COUNTER_BYTECODE } from './constants'
import { account } from './wallet'
import type { Address } from 'viem'

// Helper function to wait for transaction receipt
async function waitForReceipt(hash: `0x${string}`): Promise<TransactionReceipt> {
  return publicClient.waitForTransactionReceipt({ 
    hash,
    pollingInterval: 100, // Poll every 100 milliseconds
    retryDelay: 100,
    retryCount: 100,
  })
}

// New function to compute contract address
export function computeContractAddress(bytecode: `0x${string}`, saltHex: `0x${string}`): Address {
  const initCodeHash = keccak256(bytecode)
  return getCreate2Address({
    from: CREATE2_FACTORY_ADDRESS,
    salt: saltHex,
    bytecodeHash: initCodeHash,
  })
}

// Generalized function to deploy a contract using the CREATE2 factory
export async function deployCreate2Contract(
  bytecode: `0x${string}`,
  saltHex: `0x${string}`
): Promise<{ contractAddress: Address; receipt: TransactionReceipt }> {
  const data = `0x${saltHex.replace(/^0x/, '')}${bytecode.replace(/^0x/, '')}` as `0x${string}`

  console.debug('Deploying contract:')
  console.debug('From:', account.address)
  console.debug('To (CREATE2 Factory):', CREATE2_FACTORY_ADDRESS)
  console.debug('Salt:', saltHex)

  const hash = await walletClient.sendTransaction({
    account,
    to: CREATE2_FACTORY_ADDRESS,
    data: data,
    gas: BigInt(5000000),
  })

  console.debug('Transaction sent. Hash:', hash)

  const receipt = await waitForReceipt(hash)
  console.debug('Contract deployment receipt:', {
    transactionHash: receipt.transactionHash,
    contractAddress: receipt.contractAddress,
    gasUsed: receipt.gasUsed,
    status: receipt.status
  })

  const contractAddress = computeContractAddress(bytecode, saltHex)
  console.debug('Computed contract address:', contractAddress)

  return { contractAddress, receipt }
}

// Function to deploy the Counter contract
export async function deployCounterContract(): Promise<{ contractAddress: Address; receipt: TransactionReceipt }> {
  const saltHex = '0x' + keccak256(toHex('my_salt')).slice(2, 34).padStart(64, '0') as `0x${string}`
  console.debug('Deploying Counter contract with salt:', saltHex)
  return deployCreate2Contract(COUNTER_BYTECODE as `0x${string}`, saltHex)
}

// Function to increment the counter
export async function incrementCounter(counterAddress: `0x${string}`): Promise<TransactionReceipt> {
  console.debug('Incrementing counter at address:', counterAddress)
  const { request } = await publicClient.simulateContract({
    address: counterAddress,
    abi: COUNTER_ABI,
    functionName: 'increment',
    account: account.address,
  })

  const hash = await walletClient.writeContract(request)
  console.debug('Increment transaction sent. Hash:', hash)

  const receipt = await waitForReceipt(hash)
  console.debug('Increment transaction receipt:', receipt)

  return receipt
}

// Function to get the counter value
export async function getCounterValue(counterAddress: `0x${string}`): Promise<number> {
  const value = await publicClient.readContract({
    address: counterAddress,
    abi: COUNTER_ABI,
    functionName: 'getValue',
  }) as bigint;

  console.debug('Current counter value:', Number(value))
  return Number(value);
}