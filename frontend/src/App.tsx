import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './constants'
import { Counter } from './components/Counter'

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <Counter />
    </WagmiProvider>
  )
}

export default App
