import { useState, useEffect } from 'react';
import { Counter } from './Counter';
import { CHAIN_IDS } from '../constants';
import { CounterProvider } from '../state/CounterState';
import { CounterContract } from '../contract-interactions/counter/counterContract';
import { RouterContract } from '../contract-interactions/router/routerContract';
import { Popup } from './Popup';

export function ChainSelector() {
  const [selectedChain, setSelectedChain] = useState<number | null>(CHAIN_IDS[0]);
  const [totalCounterValue, setTotalCounterValue] = useState<number>(0);
  const [discoverableChains, setDiscoverableChains] = useState<number[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [routerContract, setRouterContract] = useState<RouterContract | null>(null);
  const [isAddingChain, setIsAddingChain] = useState(false);

  useEffect(() => {
    const initializeRouter = async () => {
      const router = new RouterContract(CHAIN_IDS[0]);
      if (!(await router.isRouterContractDeployed())) {
        await router.deployRouterContract();
      }
      setRouterContract(router);
      const chains = await router.getDiscoverableChains();
      console.log('Discoverable chains:', chains);

      setDiscoverableChains(chains);
    };

    initializeRouter();
  }, []);

  useEffect(() => {
    const fetchTotalCounterValue = async () => {
      let total = 0;
      for (const chainId of discoverableChains) {
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
  }, [discoverableChains]);

  const handleAddNewChain = async () => {
    if (routerContract && discoverableChains.length < CHAIN_IDS.length) {
      try {
        setIsAddingChain(true);
        setShowPopup(true);
        await routerContract.addNewChain();
        const updatedChains = await routerContract.getDiscoverableChains();
        setDiscoverableChains(updatedChains);
      } catch (error) {
        console.error('Error adding new chain:', error);
      } finally {
        setIsAddingChain(false);
        setTimeout(() => setShowPopup(false), 3000);
      }
    }
  };

  return (
    <div>
      <h2>Select a Chain</h2>
      <select onChange={(e) => setSelectedChain(Number(e.target.value))} value={selectedChain || ''}>
        <option value="">Choose a chain</option>
        {discoverableChains.map((chainId) => (
          <option key={chainId} value={chainId}>
            Chain {chainId}
          </option>
        ))}
      </select>
      <h3>Total Counter Value Across All Chains: {totalCounterValue}</h3>
      <button 
        onClick={handleAddNewChain} 
        disabled={discoverableChains.length === CHAIN_IDS.length || isAddingChain}
      >
        {isAddingChain ? 'Adding chain...' : 'Add new discoverable chain'}
      </button>
      {discoverableChains.map((chainId) => (
        <CounterProvider key={chainId}>
          {selectedChain === chainId && <Counter chainId={chainId} />}
        </CounterProvider>
      ))}
      {showPopup && (
        <Popup 
          message={isAddingChain ? 'Adding new chain...' : 'New chain added successfully'}
          isSuccess={!isAddingChain}
        />
      )}
    </div>
  );
}
