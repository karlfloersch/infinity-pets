import { useState } from 'react';
import { Counter } from './Counter';
import { CHAIN_IDS } from '../constants';
import { CounterProvider } from '../state/CounterState';

export function ChainSelector() {
  const [selectedChain, setSelectedChain] = useState<number | null>(null);

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
      {CHAIN_IDS.map((chainId) => (
        <CounterProvider key={chainId}>
          {selectedChain === chainId && <Counter chainId={chainId} />}
        </CounterProvider>
      ))}
    </div>
  );
}
