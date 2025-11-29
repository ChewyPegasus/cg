import React, { useState, useEffect } from 'react';
import {
  rgbToCmyk,
  cmykToRgb,
  rgbToHls,
  hlsToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToHex
} from './colorUtils';

function ColorPicker() {
  const [colorRGB, setColorRGB] = useState({ r: 51, g: 102, b: 204 });
  const [colorCMYK, setColorCMYK] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [colorHLS, setColorHLS] = useState({ h: 0, l: 0, s: 0 });
  const [colorHSV, setColorHSV] = useState({ h: 0, s: 0, v: 0 });

  const updateAllFromRgb = (r, g, b) => {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    setColorRGB({ r, g, b });
    setColorCMYK(rgbToCmyk(r, g, b));
    setColorHLS(rgbToHls(r, g, b));
    setColorHSV(rgbToHsv(r, g, b));
  };

  useEffect(() => {
    updateAllFromRgb(colorRGB.r, colorRGB.g, colorRGB.b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRGBChange = (e) => {
    const { name, value } = e.target;
    const val = Number(value);
    const newRgb = { ...colorRGB, [name]: val };
    updateAllFromRgb(newRgb.r, newRgb.g, newRgb.b);
  };

  const handleCMYKChange = (e) => {
    const { name, value } = e.target;
    const val = Number(value);

    const newCmyk = { ...colorCMYK, [name]: val };
    setColorCMYK(newCmyk);

    const newRgb = cmykToRgb(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);

    setColorRGB(newRgb);
    setColorHLS(rgbToHls(newRgb.r, newRgb.g, newRgb.b));
    setColorHSV(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHLSChange = (e) => {
    const { name, value } = e.target;
    const val = Number(value);

    const newHls = { ...colorHLS, [name]: val };
    setColorHLS(newHls);

    const newRgb = hlsToRgb(newHls.h, newHls.l, newHls.s);

    setColorRGB(newRgb);
    setColorCMYK(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
    setColorHSV(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHSVChange = (e) => {
    const { name, value } = e.target;
    const val = Number(value);

    const newHsv = { ...colorHSV, [name]: val };
    setColorHSV(newHsv);

    const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);

    setColorRGB(newRgb);
    setColorCMYK(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
    setColorHLS(rgbToHls(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHexChange = (e) => {
    const hex = e.target.value;
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    updateAllFromRgb(r, g, b);
  };

  const hexColor = rgbToHex(colorRGB.r, colorRGB.g, colorRGB.b);

  return (
    <div className="color-picker-container">
      <div className="color-display">
        <div className="color-preview" style={{ backgroundColor: hexColor }}>
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
            <div className="info-label">HLS</div>
            <div className="info-value">
              {Math.round(colorHLS.h)}°, {Math.round(colorHLS.l)}%, {Math.round(colorHLS.s)}%
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">HSV</div>
            <div className="info-value">
              {Math.round(colorHSV.h)}°, {Math.round(colorHSV.s)}%, {Math.round(colorHSV.v)}%
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
          onChange={handleHexChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="controls-section">
        <div className="color-model-card rgb-card">
          <div className="card-header">
            <span className="card-icon">🔴</span>
            <h2 className="color-model-title">RGB</h2>
          </div>
          <div className="controls-grid">
            {['r', 'g', 'b'].map(comp => (
               <div className="control-group" key={comp}>
               <label className="control-label">
                 {comp.toUpperCase()} <span className="control-value">{Math.round(colorRGB[comp])}</span>
               </label>
               <input 
                 type="range" name={comp} 
                 value={colorRGB[comp]} onChange={handleRGBChange} 
                 max="255" min="0" className={`control-slider rgb-${comp}`}
               />
             </div>
            ))}
          </div>
        </div>

        <div className="color-model-card cmyk-card">
          <div className="card-header">
            <span className="card-icon">🖨️</span>
            <h2 className="color-model-title">CMYK</h2>
          </div>
          <div className="controls-grid">
            {['c', 'm', 'y', 'k'].map(comp => (
              <div className="control-group" key={comp}>
                <label className="control-label">
                  {comp.toUpperCase()} <span className="control-value">{Math.round(colorCMYK[comp])}%</span>
                </label>
                <input 
                  type="range" name={comp} 
                  value={colorCMYK[comp]} onChange={handleCMYKChange} 
                  max="100" min="0" className={`control-slider cmyk-${comp}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="color-model-card hls-card">
          <div className="card-header">
            <span className="card-icon">💡</span>
            <h2 className="color-model-title">HLS</h2>
          </div>
          <div className="controls-grid">
             <div className="control-group">
                <label className="control-label">Hue <span className="control-value">{Math.round(colorHLS.h)}°</span></label>
                <input type="range" name="h" value={colorHLS.h} onChange={handleHLSChange} max="360" className="control-slider hls-h" />
             </div>
             <div className="control-group">
                <label className="control-label">Light <span className="control-value">{Math.round(colorHLS.l)}%</span></label>
                <input type="range" name="l" value={colorHLS.l} onChange={handleHLSChange} max="100" className="control-slider hls-l" />
             </div>
             <div className="control-group">
                <label className="control-label">Sat <span className="control-value">{Math.round(colorHLS.s)}%</span></label>
                <input type="range" name="s" value={colorHLS.s} onChange={handleHLSChange} max="100" className="control-slider hls-s" />
             </div>
          </div>
        </div>

        <div className="color-model-card hsv-card">
          <div className="card-header">
            <span className="card-icon">🌈</span>
            <h2 className="color-model-title">HSV</h2>
          </div>
          <div className="controls-grid">
             <div className="control-group">
                <label className="control-label">Hue <span className="control-value">{Math.round(colorHSV.h)}°</span></label>
                <input type="range" name="h" value={colorHSV.h} onChange={handleHSVChange} max="360" className="control-slider hsv-h" />
             </div>
             <div className="control-group">
                <label className="control-label">Sat <span className="control-value">{Math.round(colorHSV.s)}%</span></label>
                <input type="range" name="s" value={colorHSV.s} onChange={handleHSVChange} max="100" className="control-slider hsv-s" />
             </div>
             <div className="control-group">
                <label className="control-label">Val <span className="control-value">{Math.round(colorHSV.v)}%</span></label>
                <input type="range" name="v" value={colorHSV.v} onChange={handleHSVChange} max="100" className="control-slider hsv-v" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ColorPicker;
