import { Abi } from 'viem'

// Existing constants
import { abi as counterAbi, bytecode as counterBytecode } from '../../out/Counter.sol/Counter.json'

// Default private key for the embedded wallet, using a testnet account
export const DEFAULT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

export const CREATE2_FACTORY_ADDRESS = '0x4e59b44847b379578588920cA78FbF26c0B4956C'

export const CHAIN_IDS = Array.from({ length: 5 }, (_, i) => 901 + i)
export const RPC_URLS = {
  [CHAIN_IDS[0]]: 'http://localhost:9545',
  [CHAIN_IDS[1]]: 'http://localhost:9546',
  [CHAIN_IDS[2]]: 'http://localhost:9547',
  [CHAIN_IDS[3]]: 'http://localhost:9548',
  [CHAIN_IDS[4]]: 'http://localhost:9549', 
}

// Counter contract constants
export const COUNTER_ABI: Abi = counterAbi as Abi
export const COUNTER_BYTECODE = counterBytecode.object as `0x${string}`