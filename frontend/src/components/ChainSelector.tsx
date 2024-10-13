import { useState, useEffect } from 'react';
import { Counter } from './Counter';
import { CHAIN_IDS } from '../constants';
import { CounterProvider } from '../state/CounterState';
import { CounterContract } from '../contract-interactions/counter/counterContract';

export function ChainSelector() {
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [totalCounterValue, setTotalCounterValue] = useState<number>(0);

  useEffect(() => {
    const fetchTotalCounterValue = async () => {
      let total = 0;
      for (const chainId of CHAIN_IDS) {
        const counterContract = new CounterContract(chainId);
        if (await counterContract.isCounterContractDeployed()) {
          const value = await counterContract.getCounterValue();
          total += value;
        }
      }
      setTotalCounterValue(total);
    };

    fetchTotalCounterValue();
    const interval = setInterval(fetchTotalCounterValue, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Select a Chain</h2>
      <select onChange={(e) => setSelectedChain(Number(e.target.value))} value={selectedChain || ''}>
        <option value="">Choose a chain</option>
        {CHAIN_IDS.map((chainId) => (
          <option key={chainId} value={chainId}>
            Chain {chainId}
          </option>
        ))}
      </select>
      <h3>Total Counter Value Across All Chains: {totalCounterValue}</h3>
      {CHAIN_IDS.map((chainId) => (
        <CounterProvider key={chainId}>
          {selectedChain === chainId && <Counter chainId={chainId} />}
        </CounterProvider>
      ))}
    </div>
  );
}
