import { privateKeyToAccount } from 'viem/accounts'

// Default private key for the embedded wallet, using a testnet account
const DEFAULT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

export const account = privateKeyToAccount(DEFAULT_PRIVATE_KEY)
