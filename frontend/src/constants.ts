import { createPublicClient, createWalletClient, http, Abi } from 'viem'
import { account } from './contract-interactions/wallet'

// Existing constants
import { abi as counterAbi, bytecode as counterBytecode } from '../../out/Counter.sol/Counter.json'

export const CREATE2_FACTORY_ADDRESS = '0x4e59b44847b379578588920cA78FbF26c0B4956C'

export const INITIAL_CHAIN_ID = 901
export const INITIAL_RPC_URL = 'http://localhost:9545'

// New constant for CHAIN_IDS
export const CHAIN_IDS = Array.from({ length: 5 }, (_, i) => INITIAL_CHAIN_ID + i)

// Counter contract constants
export const COUNTER_ABI: Abi = counterAbi as Abi
export const COUNTER_BYTECODE = counterBytecode.object as `0x${string}`

// Custom chain configuration
export const customChain = {
  id: INITIAL_CHAIN_ID,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [INITIAL_RPC_URL] },
    public: { http: [INITIAL_RPC_URL] },
  },
}

// Configure the public client
export const publicClient = createPublicClient({
  chain: customChain,
  transport: http(INITIAL_RPC_URL)
})

// Configure the wallet client with the account from wallet.ts
export const walletClient = createWalletClient({
  account,
  chain: customChain,
  transport: http(INITIAL_RPC_URL)
})
