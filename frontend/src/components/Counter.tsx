import { useEffect, useCallback, useState } from 'react'
import { CounterContract } from '../contract-interactions/counter/contractInteractions'
import { account } from '../contract-interactions/wallet'
import { useCounterState, EventEntry } from '../state/CounterState'
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

export function Counter({ chainId }: { chainId: number }) {
  const { state, dispatch } = useCounterState();
  const { executeTransaction } = useTransaction();
  const [counterContract, setCounterContract] = useState<CounterContract | null>(null);

  useEffect(() => {
    setCounterContract(new CounterContract(chainId));
  }, []);

  const fetchCounterValue = useCallback(async () => {
    if (state.isCounterDeployed && counterContract) {
      try {
        const value = await counterContract.getCounterValue();
        dispatch({ type: 'SET_COUNTER_VALUE', payload: value.toString() });
      } catch (error) {
        console.error('Error fetching counter value:', error);
      }
    }
  }, [state.isCounterDeployed, counterContract, dispatch]);

  const checkCounterDeployment = useCallback(async () => {
    if (counterContract) {
      const deployed = await counterContract.isCounterContractDeployed();
      dispatch({ type: 'SET_COUNTER_DEPLOYED', payload: deployed });
    }
  }, [counterContract, dispatch]);

  const handleDeploy = async () => {
    if (!counterContract) return;
    try {
      await executeTransaction('Deploy Contract', async () => {
        await counterContract.deployCounterContract();
      });
      await checkCounterDeployment();
      await fetchCounterValue();
    } catch (error) {
      console.error(error);
    }
  }

  const handleIncrement = async () => {
    if (!counterContract) return;
    try {
      await executeTransaction('Increment Counter', async () => {
        await counterContract.incrementCounter();
      });
      await fetchCounterValue();
    } catch (error) {
      console.error(error);
    }
  }

  const handleTestEmitRead = async () => {
    if (!counterContract || state.events.length === 0) {
      console.error('No events available to test or contract not initialized');
      return;
    }

    const latestEvent = state.events[state.events.length - 1];

    try {
      await executeTransaction('Test Emit Read', async () => {
        await counterContract.testEmitRead(latestEvent);
      });
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
    if (state.isCounterDeployed && counterContract) {
      const unwatch = counterContract.watchCounterEvents((eventEntry: EventEntry) => {
        dispatch({
          type: 'ADD_EVENT',
          payload: eventEntry
        });
      });

      return () => {
        unwatch();
      };
    }
  }, [state.isCounterDeployed, counterContract, dispatch]);

  return (
    <div>
      <h2>Counter Contract</h2>
      {!state.isCounterDeployed ? (
        <button onClick={handleDeploy} disabled={state.transactionStatus.isProcessing}>
          {state.transactionStatus.isProcessing ? 'Deploying...' : 'Deploy Counter'}
        </button>
      ) : (
        <>
          {counterContract && <p>Counter Address: {counterContract.getCounterAddress()}</p>}
          <p>Counter Value: {state.counterValue}</p>
          <button
            onClick={handleIncrement}
            disabled={state.transactionStatus.isProcessing}
          >
            {state.transactionStatus.isProcessing ? 'Incrementing...' : 'Increment Counter'}
          </button>
        </>
      )}
      <p>Current Chain ID: {chainId}</p>
      <p>Current Account: {account.address}</p>
      {state.transactionStatus.isProcessing && (
        <Popup message={`Processing ${state.transactionStatus.currentTransaction}...`} isSuccess={false} />
      )}
      {state.transactionStatus.error && (
        <Popup message={state.transactionStatus.error} isSuccess={false} />
      )}
      <h3>Events:</h3>
      <ul>
        {state.events.map((eventEntry, index) => (
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
