import React, { useState } from 'react';
import './ControlPanel.css';

const ControlPanel = () => {
    const [sliderValue, setSliderValue] = useState(50);
    
    const handleSliderChange = (event) => {
        setSliderValue(event.target.value);
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
                    min="0"
                    max="100"
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