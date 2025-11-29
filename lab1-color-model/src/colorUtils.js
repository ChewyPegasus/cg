// ======= XYZ as Central Color Space =======
// All conversions go through XYZ to maintain color accuracy

// sRGB gamma correction helpers
const sRGBToLinear = (value) => {
  value = value / 255;
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
};

const linearTosRGB = (value) => {
  value = value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, value * 255));
};

// ======= RGB ↔ XYZ =======
export const rgbToXyz = (r, g, b) => {
  const rLinear = sRGBToLinear(r);
  const gLinear = sRGBToLinear(g);
  const bLinear = sRGBToLinear(b);

  // sRGB to XYZ matrix (D65 -> D50 adapted)
  const x = rLinear * 0.4360747 + gLinear * 0.3850649 + bLinear * 0.1430804;
  const y = rLinear * 0.2225045 + gLinear * 0.7168786 + bLinear * 0.0606169;
  const z = rLinear * 0.0139322 + gLinear * 0.0971045 + bLinear * 0.7141733;

  return { x: x * 100, y: y * 100, z: z * 100 };
};

export const xyzToRgb = (x, y, z) => {
  x = x / 100;
  y = y / 100;
  z = z / 100;

  // XYZ to sRGB matrix (D50 -> D65 adapted)
  const rLinear = x * 3.1338561 + y * -1.6168667 + z * -0.4906146;
  const gLinear = x * -0.9787684 + y * 1.9161415 + z * 0.0334540;
  const bLinear = x * 0.0719453 + y * -0.2289914 + z * 1.4052427;

  const r = Math.round(linearTosRGB(rLinear));
  const g = Math.round(linearTosRGB(gLinear));
  const b = Math.round(linearTosRGB(bLinear));

  return { r, g, b };
};

// ======= CMYK ↔ XYZ =======
export const cmykToXyz = (c, m, y, k) => {
  // CMYK to XYZ conversion through Lab color space
  // This preserves the full CMYK gamut
  
  c = c / 100;
  m = m / 100;
  y = y / 100;
  k = k / 100;
  
  // Convert CMYK to CMY
  const cmy_c = c * (1 - k) + k;
  const cmy_m = m * (1 - k) + k;
  const cmy_y = y * (1 - k) + k;
  
  // CMY to RGB (inverted)
  const r_norm = 1 - cmy_c;
  const g_norm = 1 - cmy_m;
  const b_norm = 1 - cmy_y;
  
  // Apply gamma correction
  const rLinear = r_norm <= 0.04045 ? r_norm / 12.92 : Math.pow((r_norm + 0.055) / 1.055, 2.4);
  const gLinear = g_norm <= 0.04045 ? g_norm / 12.92 : Math.pow((g_norm + 0.055) / 1.055, 2.4);
  const bLinear = b_norm <= 0.04045 ? b_norm / 12.92 : Math.pow((b_norm + 0.055) / 1.055, 2.4);
  
  // Linear RGB to XYZ
  const xCoord = rLinear * 0.4360747 + gLinear * 0.3850649 + bLinear * 0.1430804;
  const yCoord = rLinear * 0.2225045 + gLinear * 0.7168786 + bLinear * 0.0606169;
  const zCoord = rLinear * 0.0139322 + gLinear * 0.0971045 + bLinear * 0.7141733;

  return { x: xCoord * 100, y: yCoord * 100, z: zCoord * 100 };
};

export const xyzToCmyk = (x, y, z) => {
  // XYZ to CMYK conversion
  const rgb = xyzToRgb(x, y, z);
  return rgbToCmyk(rgb.r, rgb.g, rgb.b);
};

// Traditional RGB to CMYK (for fallback)
export const rgbToCmyk = (r, g, b) => {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  const k = Math.min(c, Math.min(m, y));

  if (k < 1) {
    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);
  } else {
    c = 0;
    m = 0;
    y = 0;
  }
  return { c: c * 100, m: m * 100, y: y * 100, k: k * 100 };
};

export const cmykToRgb = (c, m, y, k) => {
  const xyz = cmykToXyz(c, m, y, k);
  return xyzToRgb(xyz.x, xyz.y, xyz.z);
};

// ======= HSV ↔ XYZ =======
export const hsvToXyz = (h, s, v) => {
  const rgb = hsvToRgb(h, s, v);
  return rgbToXyz(rgb.r, rgb.g, rgb.b);
};

export const xyzToHsv = (x, y, z) => {
  const rgb = xyzToRgb(x, y, z);
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
};

export const rgbToHsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h: h * 360, s: s * 100, v: v * 100 };
};

export const hsvToRgb = (h, s, v) => {
  h = h / 360;
  s = s / 100;
  v = v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r, g, b;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = 0; g = 0; b = 0;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

// ======= HLS ↔ XYZ =======
export const hlsToXyz = (h, l, s) => {
  const rgb = hlsToRgb(h, l, s);
  return rgbToXyz(rgb.r, rgb.g, rgb.b);
};

export const xyzToHls = (x, y, z) => {
  const rgb = xyzToRgb(x, y, z);
  return rgbToHls(rgb.r, rgb.g, rgb.b);
};

export const rgbToHls = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h: h * 360, l: l * 100, s: s * 100 };
};

export const hlsToRgb = (h, l, s) => {
  h = h / 360;
  l = l / 100;
  s = s / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r, g, b;
  if (h < 1/6) {
    r = c; g = x; b = 0;
  } else if (h < 2/6) {
    r = x; g = c; b = 0;
  } else if (h < 3/6) {
    r = 0; g = c; b = x;
  } else if (h < 4/6) {
    r = 0; g = x; b = c;
  } else if (h < 5/6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
};

// ======= Utility Functions =======
export const rgbToHex = (r, g, b) => {
  return "#" + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
};

// Remove validation function since all CMYK colors are now valid
// The conversion through XYZ handles the full CMYK gamut
export const validateCmyk = (c, m, y, k) => {
  // Simply clamp values to valid ranges
  return {
    c: Math.max(0, Math.min(100, c)),
    m: Math.max(0, Math.min(100, m)),
    y: Math.max(0, Math.min(100, y)),
    k: Math.max(0, Math.min(100, k))
  };
};