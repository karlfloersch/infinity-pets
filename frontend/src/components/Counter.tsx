import { useState, useEffect } from 'react'
import {
  deployCounterContract,
  incrementCounter,
  getCounterValue,
} from '../contractInteractions'
import { INITIAL_CHAIN_ID } from '../constants'
import { account } from '../wallet'

export function Counter() {
  const [counterAddress, setCounterAddress] = useState<`0x${string}` | undefined>(
    undefined
  )
  const [counterValue, setCounterValue] = useState<string>('0')
  const [isDeploying, setIsDeploying] = useState<boolean>(false)
  const [isIncrementing, setIsIncrementing] = useState<boolean>(false)

  // Handle deploying the contract
  const handleDeploy = async () => {
    setIsDeploying(true)
    try {
      const { contractAddress } = await deployCounterContract()
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
    if (!counterAddress) return
    setIsIncrementing(true)
    try {
      await incrementCounter(counterAddress)
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

  // Fetch counter value periodically
  useEffect(() => {
    if (!counterAddress) return

    const fetchCounterValue = async () => {
      try {
        const value = await getCounterValue(counterAddress)
        setCounterValue(value.toString())
      } catch (error) {
        console.error('Error fetching counter value:', error)
      }
    }

    fetchCounterValue()
    const interval = setInterval(fetchCounterValue, 5000) // Fetch every 5 seconds

    return () => clearInterval(interval)
  }, [counterAddress])

  return (
    <div>
      <h2>Counter Contract</h2>
      {!counterAddress && (
        <button onClick={handleDeploy} disabled={isDeploying}>
          {isDeploying ? 'Deploying...' : 'Deploy Counter'}
        </button>
      )}
      {counterAddress && (
        <>
          <p>Counter Address: {counterAddress}</p>
          <p>Counter Value: {counterValue}</p>
          <button
            onClick={handleIncrement}
            disabled={isIncrementing}
          >
            {isIncrementing ? 'Incrementing...' : 'Increment Counter'}
          </button>
        </>
      )}
      <p>Current Chain ID: {INITIAL_CHAIN_ID}</p>
      <p>Current Account: {account.address}</p>
    </div>
  )
}