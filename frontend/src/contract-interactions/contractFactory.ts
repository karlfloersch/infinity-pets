import { getContract, Address, TransactionReceipt, Abi, keccak256, toHex } from 'viem'
import { deployCreate2Contract, isContractDeployed, computeContractAddress } from './contractInteractions'
import { getClient } from './wallet'

interface ContractWrapper {
  contract: any
  deploy: () => Promise<{ contractAddress: Address; receipt: TransactionReceipt }>
  isDeployed: () => Promise<boolean>
}

const defaultSalt = '0x' + keccak256(toHex('my_salt')).slice(2, 34).padStart(64, '0') as `0x${string}`

const contractCache: { [key: string]: ContractWrapper } = {}

export function getXContract(
  chainId: number,
  abi: Abi,
  bytecode: `0x${string}`,
  salt: `0x${string}` = defaultSalt
): ContractWrapper {
  const contractAddress = computeContractAddress(bytecode, salt)
  const cacheKey = `${chainId}-${contractAddress}`

  if (contractCache[cacheKey]) {
    return contractCache[cacheKey]
  }

  const { publicClient, walletClient } = getClient(chainId)

  const contract = getContract({
    address: contractAddress,
    abi,
    client: {
      public: publicClient,
      wallet: walletClient
    },
  })

  const wrapper: ContractWrapper = {
    contract,
    deploy: async () => deployCreate2Contract(bytecode, salt),
    isDeployed: async () => isContractDeployed(contractAddress),
  }

  contractCache[cacheKey] = wrapper
  return wrapper
}
