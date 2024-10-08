import { keccak256, concat, pad, toHex, TransactionReceipt } from 'viem'
import { publicClient, walletClient, CREATE2_FACTORY_ADDRESS, COUNTER_ABI, COUNTER_BYTECODE } from './constants'
import { account } from './wallet'

// Generalized function to deploy a contract using the CREATE2 factory
export async function deployCreate2Contract(
  bytecode: `0x${string}`,
  salt: string
): Promise<{ contractAddress: `0x${string}`; receipt: TransactionReceipt }> {
  // Convert the salt string to bytes and pad/truncate to 4 bytes
  const saltBytes = new TextEncoder().encode(salt)
  if (saltBytes.length > 4) {
    throw new Error('Salt must be at most 4 bytes (4 ASCII characters).')
  }
  const saltPadded = pad(saltBytes, { size: 4 })

  // Convert the salt bytes to hex
  const saltHex = toHex(saltPadded)

  // Combine salt and bytecode to form calldata
  const calldata = concat([saltHex, bytecode])

  // Prepare and send the transaction
  const hash = await walletClient.sendTransaction({
    account,
    to: CREATE2_FACTORY_ADDRESS,
    data: calldata,
  })

  // Wait for the transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  // Compute the contract address using CREATE2 formula
  const contractAddress = computeCreate2Address(
    CREATE2_FACTORY_ADDRESS,
    saltHex,
    bytecode
  )

  return { contractAddress, receipt }
}

// Helper function to compute the CREATE2 contract address
function computeCreate2Address(
  deployerAddress: `0x${string}`,
  salt: `0x${string}`,
  bytecode: `0x${string}`
): `0x${string}` {
  const create2Inputs = concat([
    '0xff',
    deployerAddress,
    salt,
    keccak256(bytecode)
  ])
  return `0x${keccak256(create2Inputs).slice(-40)}` as `0x${string}`
}

// Function to deploy the Counter contract
export async function deployCounterContract(): Promise<{ contractAddress: `0x${string}`; receipt: TransactionReceipt }> {
  const salt = 'SAP' // Using 'SAP' as the salt
  return deployCreate2Contract(COUNTER_BYTECODE as `0x${string}`, salt)
}

// Function to increment the counter
export async function incrementCounter(counterAddress: `0x${string}`): Promise<`0x${string}`> {
  const { request } = await publicClient.simulateContract({
    address: counterAddress,
    abi: COUNTER_ABI,
    functionName: 'increment',
    account: account.address,
  })

  return walletClient.writeContract(request)
}

// Function to get the counter value
export async function getCounterValue(counterAddress: `0x${string}`): Promise<number> {
  const value = await publicClient.readContract({
    address: counterAddress,
    abi: COUNTER_ABI,
    functionName: 'getValue',
  }) as bigint;

  return Number(value);
}