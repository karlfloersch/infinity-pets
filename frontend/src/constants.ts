import { createConfig, http } from '@wagmi/core'

// Existing constants
import { abi as counterAbi, bytecode as counterBytecode } from '../../out/Counter.sol/Counter.json'

export const CREATE2_FACTORY_ADDRESS = '0x0000000000FFe8B47B3e2130213B802212439497'

export const INITIAL_CHAIN_ID = 901
export const INITIAL_RPC_URL = 'http://localhost:9545'

// Counter contract constants
export const COUNTER_ABI = counterAbi
export const COUNTER_BYTECODE = counterBytecode.object

// Custom chain configuration
export const customChain = {
  id: INITIAL_CHAIN_ID,
  name: 'Localhost',
  network: 'localhost',
  rpcUrls: {
    default: { http: [INITIAL_RPC_URL] },
    public: { http: [INITIAL_RPC_URL] },
  },
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
}

// Configure the client with the custom chain
export const wagmiConfig = createConfig({
  chains: [customChain],
  transports: {
    [customChain.id]: http(INITIAL_RPC_URL),
  },
})
