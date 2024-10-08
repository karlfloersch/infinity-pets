import { useState, useEffect } from 'react'
import {
  deployCounterContract,
  incrementCounter,
  getCounterValue,
} from '../contractInteractions'
import { INITIAL_CHAIN_ID } from '../constants'
import { account } from '../wallet'

// Simple Popup component
const Popup = ({ message, isSuccess }: { message: string; isSuccess: boolean }) => (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }}>
    {isSuccess ? '✅' : '⏳'} {message}
  </div>
)

export function Counter() {
  const [counterAddress, setCounterAddress] = useState<`0x${string}` | undefined>(undefined)
  const [counterValue, setCounterValue] = useState<string>('0')
  const [isDeploying, setIsDeploying] = useState<boolean>(false)
  const [isIncrementing, setIsIncrementing] = useState<boolean>(false)
  const [showPopup, setShowPopup] = useState<boolean>(false)
  const [popupMessage, setPopupMessage] = useState<string>('')

  // Handle deploying the contract
  const handleDeploy = async () => {
    setIsDeploying(true)
    setShowPopup(true)
    setPopupMessage('Deploying contract...')
    try {
      const { contractAddress } = await deployCounterContract()
      setCounterAddress(contractAddress)
      // Fetch the initial counter value
      const value = await getCounterValue(contractAddress)
      setCounterValue(value.toString())
      setPopupMessage('Contract deployed successfully!')
    } catch (error) {
      console.error(error)
      setPopupMessage('Deployment failed. See console for details.')
    } finally {
      setIsDeploying(false)
    }
  }

  // Handle incrementing the counter
  const handleIncrement = async () => {
    if (!counterAddress) return
    setIsIncrementing(true)
    setShowPopup(true)
    setPopupMessage('Incrementing counter...')
    try {
      await incrementCounter(counterAddress)
      // Fetch the updated counter value
      const value = await getCounterValue(counterAddress)
      setCounterValue(value.toString())
      setPopupMessage('Counter incremented successfully!')
    } catch (error) {
      console.error(error)
      setPopupMessage('Increment failed. See console for details.')
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

  // Handle popup visibility
  useEffect(() => {
    if (!isDeploying && !isIncrementing) {
      // Show success popup for 3 seconds
      setTimeout(() => setShowPopup(false), 3000)
    }
  }, [isDeploying, isIncrementing])

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
      {showPopup && <Popup message={popupMessage} isSuccess={!isDeploying && !isIncrementing} />}
    </div>
  )
}