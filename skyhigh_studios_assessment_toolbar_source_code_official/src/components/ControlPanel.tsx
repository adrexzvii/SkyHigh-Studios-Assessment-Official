import React, { useState, ChangeEvent } from 'react';
import './ControlPanel.css';

const ControlPanel: React.FC = () => {
  const [sliderValue, setSliderValue] = useState<number>(50);
  
  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(event.target.value));
  };

  const handleButtonClick = () => {
    console.log('Button clicked! Current slider value:', sliderValue);
    // Aquí puedes añadir la lógica que necesites cuando se presione el botón
  };

  return (
    <div className="control-panel">
      <div className="slider-container">
        <label htmlFor="slider">Control Slider:</label>
        <input
          type="range"
          id="slider"
          min={0}
          max={100}
          value={sliderValue}
          onChange={handleSliderChange}
          className="slider"
        />
        <span className="slider-value">{sliderValue}%</span>
      </div>
      
      <button 
        className="control-button"
        onClick={handleButtonClick}
      >
        Aplicar Cambios
      </button>
    </div>
  );
};

export default ControlPanel;
