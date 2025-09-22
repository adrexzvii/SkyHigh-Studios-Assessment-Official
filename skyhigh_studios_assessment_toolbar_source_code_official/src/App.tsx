import React from 'react';
import logo from './logo.svg';
import './App.css';
import ControlPanel from './components/ControlPanel';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Control Panel Demo</h1>
        <ControlPanel />
      </header>
    </div>
  );
}

export default App;
