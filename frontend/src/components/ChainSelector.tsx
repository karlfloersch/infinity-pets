import { useState, useEffect } from 'react';
import { Counter } from './Counter';
import { CHAIN_IDS } from '../constants';
import { CounterProvider } from '../state/CounterState';
import { CounterContract } from '../contract-interactions/counter/counterContract';
import { Popup } from './Popup';

export function ChainSelector() {
  const [selectedChain, setSelectedChain] = useState<number | null>(CHAIN_IDS[0]);
  const [totalCounterValue, setTotalCounterValue] = useState<number>(0);
  const [deployedChains, setDeployedChains] = useState<number[]>([CHAIN_IDS[0]]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchTotalCounterValue = async () => {
      let total = 0;
      for (const chainId of deployedChains) {
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
  }, [deployedChains]);

  const handleDeployNewChain = () => {
    if (deployedChains.length < CHAIN_IDS.length) {
      const newChainId = CHAIN_IDS[deployedChains.length];
      setDeployedChains([...deployedChains, newChainId]);
      setSelectedChain(newChainId);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div>
      <h2>Select a Chain</h2>
      <select onChange={(e) => setSelectedChain(Number(e.target.value))} value={selectedChain || ''}>
        <option value="">Choose a chain</option>
        {deployedChains.map((chainId) => (
          <option key={chainId} value={chainId}>
            Chain {chainId}
          </option>
        ))}
      </select>
      <h3>Total Counter Value Across All Chains: {totalCounterValue}</h3>
      <button 
        onClick={handleDeployNewChain} 
        disabled={deployedChains.length === CHAIN_IDS.length}
      >
        Deploy new chain (kinda)
      </button>
      {deployedChains.map((chainId) => (
        <CounterProvider key={chainId}>
          {selectedChain === chainId && <Counter chainId={chainId} />}
        </CounterProvider>
      ))}
      {showPopup && (
        <Popup 
          message={`New chain (kinda) deployed: Chain ${selectedChain}`} 
          isSuccess={true}
        />
      )}
    </div>
  );
}
