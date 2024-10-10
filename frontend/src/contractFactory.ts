import { createPublicClient, createWalletClient, http, getContract, Address, TransactionReceipt, GetContractReturnType, PublicClient } from 'viem'
import { account } from './wallet'
import { COUNTER_ABI, COUNTER_BYTECODE, INITIAL_CHAIN_ID } from './constants'
import { deployCreate2Contract, isContractDeployed, computeContractAddress, getCounterSalt } from './contractInteractions'

interface ContractWrapper {
  contract: GetContractReturnType<typeof COUNTER_ABI, PublicClient, Address>
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

  const rpcUrl = `http://localhost:${9545 + chainId - INITIAL_CHAIN_ID}`
  
  const customChain = {
    id: chainId,
    name: `Localhost ${chainId}`,
    network: `localhost-${chainId}`,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
  }

  const publicClient = createPublicClient({
    chain: customChain,
    transport: http(rpcUrl)
  })

  const walletClient = createWalletClient({
    account,
    chain: customChain,
    transport: http(rpcUrl)
  })

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
