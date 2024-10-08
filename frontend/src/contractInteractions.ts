import { keccak256, toHex, TransactionReceipt, getCreate2Address } from 'viem'
import { publicClient, walletClient, CREATE2_FACTORY_ADDRESS, COUNTER_ABI, COUNTER_BYTECODE } from './constants'
import { account } from './wallet'
import type { Address } from 'viem'

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

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.debug('Contract deployment receipt:', {
    transactionHash: receipt.transactionHash,
    contractAddress: receipt.contractAddress,
    gasUsed: receipt.gasUsed,
    status: receipt.status
  })

  const initCodeHash = keccak256(bytecode)
  const contractAddress = computeCreate2Address(
    CREATE2_FACTORY_ADDRESS,
    saltHex,
    initCodeHash
  )

  console.debug('Computed contract address:', contractAddress)

  return { contractAddress, receipt }
}

// Updated function to compute the CREATE2 contract address
function computeCreate2Address(
  deployerAddress: Address,
  saltHex: `0x${string}`,
  initCodeHash: `0x${string}`
): Address {
  return getCreate2Address({
    from: deployerAddress,
    salt: saltHex,
    bytecodeHash: initCodeHash,
  })
}

// Function to deploy the Counter contract
export async function deployCounterContract(): Promise<{ contractAddress: Address; receipt: TransactionReceipt }> {
  const saltHex = '0x' + keccak256(toHex('my_salt')).slice(2, 34).padStart(64, '0') as `0x${string}`
  console.debug('Deploying Counter contract with salt:', saltHex)
  return deployCreate2Contract(COUNTER_BYTECODE as `0x${string}`, saltHex)
}

// Function to increment the counter
export async function incrementCounter(counterAddress: `0x${string}`): Promise<`0x${string}`> {
  console.debug('Incrementing counter at address:', counterAddress)
  const { request } = await publicClient.simulateContract({
    address: counterAddress,
    abi: COUNTER_ABI,
    functionName: 'increment',
    account: account.address,
  })

  const hash = await walletClient.writeContract(request)
  console.debug('Increment transaction sent. Hash:', hash)
  return hash
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