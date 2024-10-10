import { getContract, Address, TransactionReceipt, GetContractReturnType } from 'viem'
import { COUNTER_ABI, COUNTER_BYTECODE } from '../constants'
import { deployCreate2Contract, isContractDeployed, computeContractAddress, getCounterSalt } from './contractInteractions'
import { getClient } from './wallet'

interface ContractWrapper {
  contract: GetContractReturnType<typeof COUNTER_ABI>
  deploy: () => Promise<{ contractAddress: Address; receipt: TransactionReceipt }>
  isDeployed: () => Promise<boolean>
}

// Use the same salt for all chains
const saltHex = getCounterSalt()
const contractAddress = computeContractAddress(COUNTER_BYTECODE as `0x${string}`, saltHex)

const contractCache: { [chainId: number]: ContractWrapper } = {}

export function getCounterContract(chainId: number): ContractWrapper {
  if (contractCache[chainId]) {
    return contractCache[chainId]
  }

  const { publicClient, walletClient } = getClient(chainId)

  const contract = getContract({
    address: contractAddress,
    abi: COUNTER_ABI,
    client: {
      public: publicClient,
      wallet: walletClient
    },
  })

  const wrapper: ContractWrapper = {
    contract,
    deploy: async () => deployCreate2Contract(COUNTER_BYTECODE as `0x${string}`, saltHex),
    isDeployed: async () => isContractDeployed(contractAddress),
  }

  contractCache[chainId] = wrapper
  return wrapper
}
