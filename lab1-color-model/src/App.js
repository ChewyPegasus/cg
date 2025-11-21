import React from 'react';
import './App.css';
import ColorPicker from './ColorPicker';

function App() {
  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">Конвертер цветовых моделей</h1>
        <p className="app-subtitle">RGB • CMYK • HSV • HLS</p>
      </div>
      <ColorPicker />
    </div>
  );
}

export default App;
