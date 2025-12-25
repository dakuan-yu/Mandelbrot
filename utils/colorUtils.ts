
export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

export function interpolateColor(colors: string[], t: number) {
  const n = colors.length - 1;
  const i = Math.floor(t * n);
  const j = Math.min(i + 1, n);
  const f = (t * n) - i;

  const c1 = hexToRgb(colors[i]);
  const c2 = hexToRgb(colors[j]);

  return {
    r: Math.round(c1.r + (c2.r - c1.r) * f),
    g: Math.round(c1.g + (c2.g - c1.g) * f),
    b: Math.round(c1.b + (c2.b - c1.b) * f)
  };
}
