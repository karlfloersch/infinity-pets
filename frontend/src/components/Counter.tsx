import { useEffect, useCallback } from 'react'
import {
  deployCounterContract,
  getCounterAddress,
  testEmitRead,
  watchCounterEvents,
  incrementCounter
} from '../contract-interactions/contractInteractions'
import { getXContract } from '../contract-interactions/contractFactory'
import { INITIAL_CHAIN_ID } from '../constants'
import { account } from '../contract-interactions/wallet'
import { useCounterState, EventEntry } from '../state/CounterState'
import { useTransaction } from '../hooks/useTransaction'
import { COUNTER_ABI, COUNTER_BYTECODE } from '../constants'

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
  const { contract, isDeployed } = getXContract(INITIAL_CHAIN_ID, COUNTER_ABI, COUNTER_BYTECODE);

  const fetchCounterValue = useCallback(async () => {
    if (state.isCounterDeployed) {
      try {
        const value = await contract.read.getValue() as bigint;
        dispatch({ type: 'SET_COUNTER_VALUE', payload: value.toString() });
      } catch (error) {
        console.error('Error fetching counter value:', error);
      }
    }
  }, [state.isCounterDeployed, dispatch, contract]);

  const checkCounterDeployment = useCallback(async () => {
    const deployed = await isDeployed();
    dispatch({ type: 'SET_COUNTER_DEPLOYED', payload: deployed });
  }, [dispatch, isDeployed]);

  const handleDeploy = async () => {
    try {
      await executeTransaction('Deploy Contract', deployCounterContract);
      await checkCounterDeployment();
      await fetchCounterValue();
    } catch (error) {
      console.error(error);
    }
  }

  const handleIncrement = async () => {
    try {
      await executeTransaction('Increment Counter', incrementCounter, getCounterAddress());
      await fetchCounterValue();
    } catch (error) {
      console.error(error);
    }
  }

  const handleTestEmitRead = async () => {
    if (state.events.length === 0) { // Changed from logs to events
      console.error('No events available to test');
      return;
    }

    const latestEvent = state.events[state.events.length - 1]; // Changed from logs to events
    const counterAddress = getCounterAddress();

    try {
      await executeTransaction('Test Emit Read', testEmitRead, 
        counterAddress,
        latestEvent
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    checkCounterDeployment();
    fetchCounterValue();
    const valueInterval = setInterval(fetchCounterValue, 5000); // Fetch value every 5 seconds

    return () => clearInterval(valueInterval);
  }, [checkCounterDeployment, fetchCounterValue]);

  useEffect(() => {
    const watchEvents = async () => {
      const unwatch = watchCounterEvents(INITIAL_CHAIN_ID, (eventEntry: EventEntry) => {
        dispatch({
          type: 'ADD_EVENT',
          payload: eventEntry
        });
      });

      return () => {
        unwatch();
      };
    };

    if (state.isCounterDeployed) {
      watchEvents();
    }
  }, [state.isCounterDeployed, dispatch]);

  return (
    <div>
      <h2>Counter Contract</h2>
      {!state.isCounterDeployed ? (
        <button onClick={handleDeploy} disabled={state.transactionStatus.isProcessing}>
          {state.transactionStatus.isProcessing ? 'Deploying...' : 'Deploy Counter'}
        </button>
      ) : (
        <>
          <p>Counter Address: {getCounterAddress()}</p>
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
      <h3>Events:</h3>
      <ul>
        {state.events.map((eventEntry, index) => ( // Changed from logs to events
          <li key={index}>
            Chain ID: {eventEntry.chainId}, 
            Block Number: {eventEntry.log.blockNumber ? eventEntry.log.blockNumber.toString() : 'N/A'}, 
            Event: {eventEntry.log.topics[1]},
            Timestamp: {new Date(Number(eventEntry.timestamp) * 1000).toLocaleString()}
          </li>
        ))}
      </ul>
      <button 
        onClick={handleTestEmitRead} 
        disabled={!state.isCounterDeployed || state.events.length === 0}
      >
        Test Emit Read
      </button>
    </div>
  )
}