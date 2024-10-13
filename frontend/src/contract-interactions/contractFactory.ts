import { Address, TransactionReceipt, Abi, keccak256, toHex, getCreate2Address } from 'viem'
import { CREATE2_FACTORY_ADDRESS } from '../constants'
import { account, getClient } from './wallet'

// Updated ContractWrapper interface with address field
interface ContractWrapper {
  address: Address
  sendTx: (
    functionName: string,
    args?: any[]
  ) => Promise<TransactionReceipt>
  call: (
    functionName: string,
    args?: any[]
  ) => Promise<any>
  deploy: () => Promise<{ contractAddress: Address; receipt: TransactionReceipt }>
  isDeployed: () => Promise<boolean>
}

// Default salt value
const defaultSalt = '0x' + keccak256(toHex('my_salt')).slice(2, 34).padStart(64, '0') as `0x${string}`

// Contract cache to avoid redundant instances
const contractCache: { [key: string]: ContractWrapper } = {}

// Function to compute contract address
export function computeXContractAddress(bytecode: `0x${string}`, saltHex: `0x${string}` = defaultSalt): Address {
  const initCodeHash = keccak256(bytecode)
  return getCreate2Address({
    from: CREATE2_FACTORY_ADDRESS,
    salt: saltHex,
    bytecodeHash: initCodeHash,
  })
}

// Generalized function to deploy a contract using the CREATE2 factory
export async function deployXContract(
  chainId: number,
  bytecode: `0x${string}`,
  saltHex: `0x${string}` = defaultSalt
): Promise<{ contractAddress: Address; receipt: TransactionReceipt }> {
  const { publicClient, walletClient } = getClient(chainId)
  const data = `0x${saltHex.replace(/^0x/, '')}${bytecode.replace(/^0x/, '')}` as `0x${string}`

  console.debug('Deploying contract:')
  console.debug('Chain ID:', chainId)
  console.debug('To (CREATE2 Factory):', CREATE2_FACTORY_ADDRESS)
  console.debug('Salt:', saltHex)

  const hash = await walletClient.sendTransaction({
    account: account,
    chain: walletClient.chain,
    to: CREATE2_FACTORY_ADDRESS,
    data: data,
    gas: BigInt(5000000),
  })

  console.debug('Transaction sent. Hash:', hash)

  const receipt = await publicClient.waitForTransactionReceipt({ 
    hash,
    pollingInterval: 100,
    retryDelay: 100,
    retryCount: 100,
  })

  console.debug('Contract deployment receipt:', {
    transactionHash: receipt.transactionHash,
    contractAddress: receipt.contractAddress,
    gasUsed: receipt.gasUsed,
    status: receipt.status
  })

  const contractAddress = computeXContractAddress(bytecode, saltHex)
  console.debug('Computed contract address:', contractAddress)

  return { contractAddress, receipt }
}

// Function to check if a contract is deployed at a given address
export async function isXContractDeployed(chainId: number, address: Address): Promise<boolean> {
  const { publicClient } = getClient(chainId)
  try {
    const code = await publicClient.getCode({ address })
    // If the bytecode is not empty, the contract is deployed
    return code !== undefined && code !== '0x'
  } catch (error) {
    console.error('Error checking contract deployment:', error)
    return false
  }
}

// Separate sendTx function
export async function sendTx(
  chainId: number,
  contractAddress: Address,
  abi: Abi,
  functionName: string,
  args: any[] = []
): Promise<TransactionReceipt> {
  const { publicClient, walletClient } = getClient(chainId)
  console.debug(`Preparing to send transaction for function ${functionName} with args:`, args)
  
  // Simulate the contract call to get the transaction request
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi,
    functionName,
    args,
    account: account.address,
  })

  // Send the transaction
  const hash = await walletClient.writeContract(request)
  console.debug(`${functionName} transaction sent. Hash:`, hash)

  // Wait for the transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.debug(`${functionName} transaction receipt:`, receipt)

  return receipt
}

// Separate call function
export async function call(
  chainId: number,
  contractAddress: Address,
  abi: Abi,
  functionName: string,
  args: any[] = []
): Promise<any> {
  const { publicClient } = getClient(chainId)
  console.debug(`Calling function ${functionName} with args:`, args)
  
  // Read the contract data
  const result = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName,
    args,
  })
  console.debug(`Result of ${functionName}:`, result)
  return result
}

// Updated getXContract function
export function getXContract(
  chainId: number,
  abi: Abi,
  bytecode: `0x${string}`,
  salt: `0x${string}` = defaultSalt
): ContractWrapper {
  const contractAddress = computeXContractAddress(bytecode, salt)
  const cacheKey = `${chainId}-${contractAddress}`

  if (contractCache[cacheKey]) {
    return contractCache[cacheKey]
  }

  // Create the ContractWrapper without directly exposing the viem contract object
  const wrapper: ContractWrapper = {
    address: contractAddress,
    sendTx: (functionName: string, args: any[] = []) => sendTx(chainId, contractAddress, abi, functionName, args),
    call: (functionName: string, args: any[] = []) => call(chainId, contractAddress, abi, functionName, args),
    deploy: () => deployXContract(chainId, bytecode, salt),
    isDeployed: () => isXContractDeployed(chainId, contractAddress),
  }

  contractCache[cacheKey] = wrapper
  return wrapper
}
