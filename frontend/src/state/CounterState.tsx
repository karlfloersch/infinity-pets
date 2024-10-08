import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Address } from 'viem';

// Define the state shape
interface CounterState {
  counterAddress: Address | undefined;
  counterValue: string;
  transactionStatus: {
    isProcessing: boolean;
    currentTransaction: string | null;
    error: string | null;
  };
}

// Define action types
type Action =
  | { type: 'SET_COUNTER_ADDRESS'; payload: Address }
  | { type: 'SET_COUNTER_VALUE'; payload: string }
  | { type: 'START_TRANSACTION'; payload: { name: string } }
  | { type: 'END_TRANSACTION'; payload: { name: string; success: boolean; error?: string } };

// Initial state
const initialState: CounterState = {
  counterAddress: undefined,
  counterValue: '0',
  transactionStatus: {
    isProcessing: false,
    currentTransaction: null,
    error: null,
  },
};

// Reducer function
function counterReducer(state: CounterState, action: Action): CounterState {
  switch (action.type) {
    case 'SET_COUNTER_ADDRESS':
      return { ...state, counterAddress: action.payload };
    case 'SET_COUNTER_VALUE':
      return { ...state, counterValue: action.payload };
    case 'START_TRANSACTION':
      return {
        ...state,
        transactionStatus: {
          isProcessing: true,
          currentTransaction: action.payload.name,
          error: null,
        },
      };
    case 'END_TRANSACTION':
      return {
        ...state,
        transactionStatus: {
          isProcessing: false,
          currentTransaction: null,
          error: action.payload.success ? null : action.payload.error || 'Unknown error',
        },
      };
    default:
      return state;
  }
}

// Create context
const CounterStateContext = createContext<{
  state: CounterState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Provider component
export function CounterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <CounterStateContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterStateContext.Provider>
  );
}

// Hook to use the counter state
export function useCounterState() {
  const context = useContext(CounterStateContext);
  if (context === undefined) {
    throw new Error('useCounterState must be used within a CounterProvider');
  }
  return context;
}
