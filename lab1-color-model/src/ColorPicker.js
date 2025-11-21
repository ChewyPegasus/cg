import React, { useState, useEffect } from 'react';
import { rgbToCmyk, cmykToRgb, rgbToHsv, hsvToRgb, rgbToHls, hlsToRgb, rgbToHex } from './colorUtils';

function ColorPicker() {
  const [colorRGB, setColorRGB] = useState({ r: 255, g: 100, b: 50 });
  const [colorCMYK, setColorCMYK] = useState({ c: 0, m: 60, y: 80, k: 0 });
  const [colorHSV, setColorHSV] = useState({ h: 0, s: 100, v: 100 });
  const [colorHLS, setColorHLS] = useState({ h: 0, l: 50, s: 100 });

  // Update all color models from RGB
  const updateFromRGB = (rgb) => {
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const hls = rgbToHls(rgb.r, rgb.g, rgb.b);
    
    setColorRGB(rgb);
    setColorCMYK(cmyk);
    setColorHSV(hsv);
    setColorHLS(hls);
  };

  // Initialize colors on mount
  useEffect(() => {
    updateFromRGB(colorRGB);
  }, []);

  // RGB handlers
  const handleRGBChange = (e) => {
    const { name, value } = e.target;
    const newValue = Math.max(0, Math.min(255, Number(value) || 0));
    const updated = { ...colorRGB, [name]: newValue };
    updateFromRGB(updated);
  };

  // CMYK handlers
  const handleCMYKChange = (e) => {
    const { name, value } = e.target;
    const newValue = Math.max(0, Math.min(100, Number(value) || 0));
    const updated = { ...colorCMYK, [name]: newValue };
    setColorCMYK(updated);
    const rgb = cmykToRgb(updated.c, updated.m, updated.y, updated.k);
    updateFromRGB(rgb);
  };

  // HSV handlers
  const handleHSVChange = (e) => {
    const { name, value } = e.target;
    let newValue = Number(value) || 0;
    if (name === 'h') newValue = Math.max(0, Math.min(360, newValue));
    else newValue = Math.max(0, Math.min(100, newValue));
    
    const updated = { ...colorHSV, [name]: newValue };
    setColorHSV(updated);
    const rgb = hsvToRgb(updated.h, updated.s, updated.v);
    updateFromRGB(rgb);
  };

  // HLS handlers
  const handleHLSChange = (e) => {
    const { name, value } = e.target;
    let newValue = Number(value) || 0;
    if (name === 'h') newValue = Math.max(0, Math.min(360, newValue));
    else newValue = Math.max(0, Math.min(100, newValue));
    
    const updated = { ...colorHLS, [name]: newValue };
    setColorHLS(updated);
    const rgb = hlsToRgb(updated.h, updated.l, updated.s);
    updateFromRGB(rgb);
  };

  const rgbColor = `rgb(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b})`;
  const hexColor = rgbToHex(colorRGB.r, colorRGB.g, colorRGB.b);

  return (
    <div className="color-picker-container">
      {/* Color Preview Section */}
      <div className="color-display">
        <div className="color-preview" style={{ backgroundColor: rgbColor }}>
          <div className="color-overlay">
            <div className="hex-display">{hexColor.toUpperCase()}</div>
          </div>
        </div>
        
        <div className="color-info-cards">
          <div className="info-card">
            <div className="info-label">RGB</div>
            <div className="info-value">{Math.round(colorRGB.r)}, {Math.round(colorRGB.g)}, {Math.round(colorRGB.b)}</div>
          </div>
          <div className="info-card">
            <div className="info-label">CMYK</div>
            <div className="info-value">
              {Math.round(colorCMYK.c)}%, {Math.round(colorCMYK.m)}%, {Math.round(colorCMYK.y)}%, {Math.round(colorCMYK.k)}%
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">HSV</div>
            <div className="info-value">
              {Math.round(colorHSV.h)}°, {Math.round(colorHSV.s)}%, {Math.round(colorHSV.v)}%
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">HLS</div>
            <div className="info-value">
              {Math.round(colorHLS.h)}°, {Math.round(colorHLS.l)}%, {Math.round(colorHLS.s)}%
            </div>
          </div>
        </div>

        <button 
          className="palette-button" 
          onClick={() => document.getElementById('colorPicker').click()}
        >
          Выбрать цвет
        </button>

        <input
          id="colorPicker"
          type="color"
          value={hexColor}
          onChange={(e) => {
            const hex = e.target.value;
            const bigint = parseInt(hex.slice(1), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            updateFromRGB({ r, g, b });
          }}
          style={{ display: 'none' }}
        />
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        {/* RGB Model */}
        <div className="color-model-card rgb-card">
          <div className="card-header">
            <span className="card-icon">🔴</span>
            <h2 className="color-model-title">RGB</h2>
            <span className="card-badge">0-255</span>
          </div>
          
          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label">
                Red
                <span className="control-value">{Math.round(colorRGB.r)}</span>
              </label>
              <input 
                type="range" 
                name="r" 
                value={colorRGB.r} 
                onChange={handleRGBChange} 
                max="255" 
                min="0" 
                className="control-slider rgb-r"
              />
            </div>
            <div className="control-group">
              <label className="control-label">
                Green
                <span className="control-value">{Math.round(colorRGB.g)}</span>
              </label>
              <input 
                type="range" 
                name="g" 
                value={colorRGB.g} 
                onChange={handleRGBChange} 
                max="255" 
                min="0" 
                className="control-slider rgb-g"
              />
            </div>
            <div className="control-group">
              <label className="control-label">
                Blue
                <span className="control-value">{Math.round(colorRGB.b)}</span>
              </label>
              <input 
                type="range" 
                name="b" 
                value={colorRGB.b} 
                onChange={handleRGBChange} 
                max="255" 
                min="0" 
                className="control-slider rgb-b"
              />
            </div>
          </div>
        </div>

        {/* CMYK Model */}
        <div className="color-model-card cmyk-card">
          <div className="card-header">
            <span className="card-icon">🖨️</span>
            <h2 className="color-model-title">CMYK</h2>
            <span className="card-badge">0-100%</span>
          </div>
          
          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label">
                Cyan
                <span className="control-value">{Math.round(colorCMYK.c)}%</span>
              </label>
              <input 
                type="range" 
                name="c" 
                value={colorCMYK.c} 
                onChange={handleCMYKChange} 
                max="100" 
                min="0" 
                className="control-slider cmyk-c"
              />
            </div>
            <div className="control-group">
              <label className="control-label">
                Magenta
                <span className="control-value">{Math.round(colorCMYK.m)}%</span>
              </label>
              <input 
                type="range" 
                name="m" 
                value={colorCMYK.m} 
                onChange={handleCMYKChange} 
                max="100" 
                min="0" 
                className="control-slider cmyk-m"
              />
            </div>
            <div className="control-group">
              <label className="control-label">
                Yellow
                <span className="control-value">{Math.round(colorCMYK.y)}%</span>
              </label>
              <input 
                type="range" 
                name="y" 
                value={colorCMYK.y} 
                onChange={handleCMYKChange} 
                max="100" 
                min="0" 
                className="control-slider cmyk-y"
              />
            </div>
            <div className="control-group">
              <label className="control-label">
                Black
                <span className="control-value">{Math.round(colorCMYK.k)}%</span>
              </label>
              <input 
                type="range" 
                name="k" 
                value={colorCMYK.k} 
                onChange={handleCMYKChange} 
                max="100" 
                min="0" 
                className="control-slider cmyk-k"
              />
            </div>
          </div>
        </div>

        {/* HSV Model */}
        <div className="color-model-card hsv-card">
          <div className="card-header">
            <span className="card-icon">🌈</span>
            <h2 className="color-model-title">HSV</h2>
            <span className="card-badge">Hue/Sat/Val</span>
          </div>
          
          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label">
                Hue
                <span className="control-value">{Math.round(colorHSV.h)}°</span>
              </label>
              <input 
                type="range" 
                name="h" 
                value={colorHSV.h} 
                onChange={handleHSVChange} 
                max="360" 
                min="0" 
                className="control-slider hsv-h"
              />
            </div>
            <div className="control-group">
              <label className="control-label">
                Saturation
                <span className="control-value">{Math.round(colorHSV.s)}%</span>
              </label>
              <input 
                type="range" 
                name="s" 
                value={colorHSV.s} 
                onChange={handleHSVChange} 
                max="100" 
                min="0" 
                className="control-slider hsv-s"
              />
            </div>
            <div className="control-group">
              <label className="control-label">
                Value
                <span className="control-value">{Math.round(colorHSV.v)}%</span>
              </label>
              <input 
                type="range" 
                name="v" 
                value={colorHSV.v} 
                onChange={handleHSVChange} 
                max="100" 
                min="0" 
                className="control-slider hsv-v"
              />
            </div>
          </div>
        </div>

        {/* HLS Model */}
        <div className="color-model-card hls-card">
          <div className="card-header">
            <span className="card-icon">💡</span>
            <h2 className="color-model-title">HLS</h2>
            <span className="card-badge">Hue/Light/Sat</span>
          </div>
          
          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label">
                Hue
                <span className="control-value">{Math.round(colorHLS.h)}°</span>
              </label>
              <input 
                type="range" 
                name="h" 
                value={colorHLS.h} 
                onChange={handleHLSChange} 
                max="360" 
                min="0" 
                className="control-slider hls-h"
              />
            </div>
            <div className="control-group">
              <label className="control-label">
                Lightness
                <span className="control-value">{Math.round(colorHLS.l)}%</span>
              </label>
              <input 
                type="range" 
                name="l" 
                value={colorHLS.l} 
                onChange={handleHLSChange} 
                max="100" 
                min="0" 
                className="control-slider hls-l"
              />
            </div>
            <div className="control-group">
              <label className="control-label">
                Saturation
                <span className="control-value">{Math.round(colorHLS.s)}%</span>
              </label>
              <input 
                type="range" 
                name="s" 
                value={colorHLS.s} 
                onChange={handleHLSChange} 
                max="100" 
                min="0" 
                className="control-slider hls-s"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColorPicker;
