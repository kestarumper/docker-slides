import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [data, setData] = useState({})

  useEffect(() => {
    fetch("http://localhost:4000/users")
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
  }, [data])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <pre style={{textAlign: 'left'}}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </header>
    </div>
  );
}

export default App;
