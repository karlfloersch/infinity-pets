import { privateKeyToAccount } from 'viem/accounts'
import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from 'viem'

import { INITIAL_CHAIN_ID } from '../constants'

// Default private key for the embedded wallet, using a testnet account
const DEFAULT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

export const account = privateKeyToAccount(DEFAULT_PRIVATE_KEY)

interface ClientWrapper {
  publicClient: PublicClient
  walletClient: WalletClient
}

const clientCache: { [chainId: number]: ClientWrapper } = {}

export function getClient(chainId: number): ClientWrapper {
  if (clientCache[chainId]) {
    return clientCache[chainId]
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

  const wrapper: ClientWrapper = {
    publicClient,
    walletClient
  }

  clientCache[chainId] = wrapper
  return wrapper
}
