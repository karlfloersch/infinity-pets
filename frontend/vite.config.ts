import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '')
  
  // Parse chain IDs from env or use defaults
  const chainIds = env.CHAIN_IDS ? 
    env.CHAIN_IDS.split(',').map(Number) : 
    [901, 902, 903, 904, 905]

  // Generate RPC URLs map
  const rpcUrls = Object.fromEntries(
    chainIds.map(id => [
      id,
      env[`RPC_URL_${id}`] || `http://localhost:${9545 + id - 901}`
    ])
  )

  // Ensure private key starts with 0x
  const privateKey = env.DEFAULT_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`

  return {
    plugins: [react()],
    define: {
      __CHAIN_IDS__: JSON.stringify(chainIds),
      __RPC_URLS__: JSON.stringify(rpcUrls),
      __DEFAULT_PRIVATE_KEY__: JSON.stringify(formattedPrivateKey)
    }
  }
})
