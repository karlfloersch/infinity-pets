import { useCounterState } from '../state/CounterState';

type TransactionFunction<T> = (...args: any[]) => Promise<T>;

export function useTransaction() {
  const { dispatch } = useCounterState();

  const executeTransaction = async <T>(
    transactionName: string,
    transactionFunction: TransactionFunction<T>,
    ...args: any[]
  ): Promise<T> => {
    dispatch({ type: 'START_TRANSACTION', payload: { name: transactionName } });
    try {
      const result = await transactionFunction(...args);
      dispatch({ type: 'END_TRANSACTION', payload: { name: transactionName, success: true } });
      return result;
    } catch (error) {
      console.error(`${transactionName} failed:`, error);
      dispatch({ type: 'END_TRANSACTION', payload: { name: transactionName, success: false, error: String(error) } });
      throw error;
    }
  };

  return { executeTransaction };
}
