import React from 'react';
import DataTableComponent from './components/DataTable';
import './styles/global.css'; 

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Table</h1>
      <DataTableComponent />
    </div>
  );
};

export default App;


