import { useEffect, useCallback } from 'react'
import {
  deployCounterContract,
  incrementCounter,
  getCounterValue,
  isCounterContractDeployed,
  getCounterAddress,
  testEmitRead
} from '../contractInteractions'
import { INITIAL_CHAIN_ID, publicClient, COUNTER_ABI } from '../constants'
import { account } from '../wallet'
import { useCounterState } from '../state/CounterState'
import { useTransaction } from '../hooks/useTransaction'
import { Log } from 'viem'

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
    if (state.isCounterDeployed) {
      try {
        const value = await getCounterValue(getCounterAddress());
        dispatch({ type: 'SET_COUNTER_VALUE', payload: value.toString() });
      } catch (error) {
        console.error('Error fetching counter value:', error);
      }
    }
  }, [state.isCounterDeployed, dispatch]);

  const checkCounterDeployment = useCallback(async () => {
    const isDeployed = await isCounterContractDeployed();
    dispatch({ type: 'SET_COUNTER_DEPLOYED', payload: isDeployed });
  }, [dispatch]);

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
    if (state.logs.length === 0) {
      console.error('No logs available to test');
      return;
    }

    const latestLog = state.logs[state.logs.length - 1];
    const counterAddress = getCounterAddress();

    try {
      await executeTransaction('Test Emit Read', testEmitRead, 
        counterAddress,
        latestLog.log,
        latestLog.timestamp, // Use the timestamp from our state
        BigInt(publicClient.chain.id)
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
    const watchLogs = async () => {
      const counterAddress = getCounterAddress();
      const unwatch = publicClient.watchContractEvent({
        address: counterAddress,
        abi: COUNTER_ABI,
        fromBlock: 0n,
        onLogs: async (logs: Log[]) => {
          for (const log of logs) {
            if (log.blockNumber) {
              const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
              dispatch({
                type: 'ADD_LOG',
                payload: { 
                  log, 
                  chainId: publicClient.chain.id, 
                  timestamp: block.timestamp 
                },
              });
            } else {
              console.warn('Log received without block number:', log);
            }
          }
        },
      });

      return () => {
        unwatch();
      };
    };

    if (state.isCounterDeployed) {
      watchLogs();
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
      <h3>Logs:</h3>
      <ul>
        {state.logs.map((logEntry, index) => (
          <li key={index}>
            Chain ID: {logEntry.chainId}, 
            Block Number: {logEntry.log.blockNumber ? logEntry.log.blockNumber.toString() : 'N/A'}, 
            Event: {logEntry.log.topics[1]},
            Timestamp: {new Date(Number(logEntry.timestamp) * 1000).toLocaleString()}
          </li>
        ))}
      </ul>
      <button onClick={handleTestEmitRead} disabled={!state.isCounterDeployed || state.logs.length === 0}>
        Test Emit Read
      </button>
    </div>
  )
}