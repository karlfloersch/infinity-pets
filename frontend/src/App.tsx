import { Counter } from './components/Counter';
import { CounterProvider } from './state/CounterState';

function App() {
  return (
    <CounterProvider>
      <div className="App">
        <Counter />
      </div>
    </CounterProvider>
  );
}

export default App;
