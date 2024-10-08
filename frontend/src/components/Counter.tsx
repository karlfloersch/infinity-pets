import { useState } from 'react'
import { useAccount } from 'wagmi'
import {
  deployCounterContract,
  incrementCounter,
  getCounterValue,
} from '../contractInteractions'
import { INITIAL_CHAIN_ID } from '../constants'

export function Counter() {
  const { address } = useAccount()
  const [counterAddress, setCounterAddress] = useState<`0x${string}` | undefined>(
    undefined
  )
  const [counterValue, setCounterValue] = useState<string>('0')
  const [isDeploying, setIsDeploying] = useState<boolean>(false)
  const [isIncrementing, setIsIncrementing] = useState<boolean>(false)

  // Handle deploying the contract
  const handleDeploy = async () => {
    if (!address) return
    setIsDeploying(true)
    try {
      const { contractAddress } = await deployCounterContract(address as `0x${string}`)
      setCounterAddress(contractAddress)
      // Fetch the initial counter value
      const value = await getCounterValue(contractAddress)
      setCounterValue(value.toString())
    } catch (error) {
      console.error(error)
      alert('Deployment failed. See console for details.')
    } finally {
      setIsDeploying(false)
    }
  }

  // Handle incrementing the counter
  const handleIncrement = async () => {
    if (!counterAddress || !address) return
    setIsIncrementing(true)
    try {
      await incrementCounter(address as `0x${string}`, counterAddress)
      // Fetch the updated counter value
      const value = await getCounterValue(counterAddress)
      setCounterValue(value.toString())
    } catch (error) {
      console.error(error)
      alert('Increment failed. See console for details.')
    } finally {
      setIsIncrementing(false)
    }
  }

  return (
    <div>
      <h2>Counter Contract</h2>
      {!counterAddress && (
        <button onClick={handleDeploy} disabled={!address || isDeploying}>
          {isDeploying ? 'Deploying...' : 'Deploy Counter'}
        </button>
      )}
      {counterAddress && (
        <>
          <p>Counter Address: {counterAddress}</p>
          <p>Counter Value: {counterValue}</p>
          <button
            onClick={handleIncrement}
            disabled={!address || isIncrementing}
          >
            {isIncrementing ? 'Incrementing...' : 'Increment Counter'}
          </button>
        </>
      )}
      <p>Current Chain ID: {INITIAL_CHAIN_ID}</p>
      <p>Current Account: {address || 'Not connected'}</p>
    </div>
  )
}