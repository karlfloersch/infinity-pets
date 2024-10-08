import { useEffect, useCallback } from 'react'
import {
  deployCounterContract,
  incrementCounter,
  getCounterValue,
} from '../contractInteractions'
import { INITIAL_CHAIN_ID } from '../constants'
import { account } from '../wallet'
import { useCounterState } from '../state/CounterState'
import { useTransaction } from '../hooks/useTransaction'

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
  const { state, dispatch } = useCounterState();
  const { executeTransaction } = useTransaction();

  const fetchCounterValue = useCallback(async () => {
    if (state.counterAddress) {
      try {
        const value = await getCounterValue(state.counterAddress);
        dispatch({ type: 'SET_COUNTER_VALUE', payload: value.toString() });
      } catch (error) {
        console.error('Error fetching counter value:', error);
      }
    }
  }, [state.counterAddress, dispatch]);

  const handleDeploy = async () => {
    try {
      const { contractAddress } = await executeTransaction('Deploy Contract', deployCounterContract);
      dispatch({ type: 'SET_COUNTER_ADDRESS', payload: contractAddress });
      await fetchCounterValue();
    } catch (error) {
      console.error(error);
    }
  }

  const handleIncrement = async () => {
    if (!state.counterAddress) return;
    try {
      await executeTransaction('Increment Counter', incrementCounter, state.counterAddress);
      await fetchCounterValue();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchCounterValue();
    const valueInterval = setInterval(fetchCounterValue, 5000); // Fetch value every 5 seconds

    return () => clearInterval(valueInterval);
  }, [fetchCounterValue]);

  return (
    <div>
      <h2>Counter Contract</h2>
      <button onClick={handleDeploy} disabled={state.transactionStatus.isProcessing}>
        {state.transactionStatus.isProcessing ? 'Deploying...' : 'Deploy Counter'}
      </button>
      {state.counterAddress && (
        <>
          <p>Counter Address: {state.counterAddress}</p>
          <p>Counter Value: {state.counterValue}</p>
          <button
            onClick={handleIncrement}
            disabled={state.transactionStatus.isProcessing}
          >
            {state.transactionStatus.isProcessing ? 'Incrementing...' : 'Increment Counter'}
          </button>
        </>
      )}
      <p>Current Chain ID: {INITIAL_CHAIN_ID}</p>
      <p>Current Account: {account.address}</p>
      {state.transactionStatus.isProcessing && (
        <Popup message={`Processing ${state.transactionStatus.currentTransaction}...`} isSuccess={false} />
      )}
      {state.transactionStatus.error && (
        <Popup message={state.transactionStatus.error} isSuccess={false} />
      )}
    </div>
  )
}