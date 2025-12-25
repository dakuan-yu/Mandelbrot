
export const PALETTES = {
  'Electric Blue': ['#000764', '#206bcb', '#edffff', '#ffaa00', '#000200'],
  'Magma': ['#000004', '#1b0c41', '#4b0c6b', '#781c6d', '#a52c60', '#cf4446', '#ed6925', '#fb9a06', '#f7d03c', '#fcffa4'],
  'Deep Forest': ['#041d01', '#0b4d02', '#218c02', '#4ec000', '#b6ef00'],
  'Monochrome': ['#000000', '#ffffff'],
  'Cyberpunk': ['#0d0221', '#240b36', '#c31432', '#fdbb2d', '#22c1c3']
};

export const INITIAL_VIEW: { centerX: number; centerY: number; zoom: number } = {
  centerX: -0.5,
  centerY: 0,
  zoom: 1.5
};

export interface Bookmark {
  name: string;
  x: number;
  y: number;
  zoom: number;
  description: string;
}

export interface EquationPreset {
  name: string;
  formula: string;
  real: string;
  imag: string;
  bookmarks: Bookmark[];
}

export const EQUATION_PRESETS: EquationPreset[] = [
  { 
    name: 'Mandelbrot Set', 
    formula: 'Z_{n+1} = Z_{n}^2 + C',
    real: 'x*x - y*y + x0', 
    imag: '2*x*y + y0',
    bookmarks: [
      { name: "The Main Bulb", x: -0.5, y: 0, zoom: 1.5, description: "The central cardioid and main circular bulb." },
      { name: "Seahorse Valley", x: -0.743643887037158, y: 0.13182590420531197, zoom: 0.000001, description: "A famous region full of spiral shapes resembling seahorses." },
      { name: "Triple Spiral", x: -0.088, y: 0.654, zoom: 0.001, description: "Elegant triple-spiral structures." },
      { name: "Elephant Valley", x: 0.28, y: 0.008, zoom: 0.01, description: "Named for the elephant-trunk-like structures." }
    ]
  },
  { 
    name: 'Cubic Mandelbrot', 
    formula: 'Z_{n+1} = Z_{n}^3 + C',
    real: 'x*x*x - 3*x*y*y + x0', 
    imag: '3*x*x*y - y*y*y + y0',
    bookmarks: [
      { name: "Cubic Core", x: 0, y: 0, zoom: 2, description: "The center of the cubic Mandelbrot set." },
      { name: "Symmetric Valley", x: -0.42, y: 0, zoom: 0.1, description: "Highly symmetric structures along the real axis." },
      { name: "Edge Spirals", x: 0.2, y: 0.45, zoom: 0.05, description: "Spiraling filaments at the boundary." }
    ]
  },
  { 
    name: 'Burning Ship', 
    formula: 'Z_{n+1} = (|Re(Z_{n})| + i|Im(Z_{n})|)^2 + C',
    real: 'x*x - y*y + x0', 
    imag: 'Math.abs(2*x*y) + y0',
    bookmarks: [
      { name: "The Ship", x: -0.45, y: -0.5, zoom: 1.5, description: "The iconic ship-like structure." },
      { name: "Masts", x: -1.75, y: -0.03, zoom: 0.1, description: "The long needle-like masts extending outwards." },
      { name: "Hull Detail", x: -1.744, y: -0.01, zoom: 0.001, description: "Intricate chaotic structures near the hull." }
    ]
  },
  { 
    name: 'Tricorn', 
    formula: 'Z_{n+1} = \\bar{Z}_{n}^2 + C',
    real: 'x*x - y*y + x0', 
    imag: '-2*x*y + y0',
    bookmarks: [
      { name: "The Hat", x: 0, y: 0, zoom: 2.5, description: "The main three-pointed shape." },
      { name: "Pointed Edge", x: -1.1, y: 0, zoom: 0.2, description: "A detailed view of one of the tricorn tips." }
    ]
  },
  {
    name: 'Celtic Fractal',
    formula: 'Z_{n+1} = |Re(Z_{n}^2)| + i Im(Z_{n}^2) + C',
    real: 'Math.abs(x*x - y*y) + x0',
    imag: '2*x*y + y0',
    bookmarks: [
      { name: "Celtic Knot", x: -0.1, y: 0, zoom: 2, description: "The central overlapping circular patterns." },
      { name: "Braided Valley", x: 0.5, y: 0.3, zoom: 0.1, description: "Filaments that look like braided ropes." }
    ]
  }
];

export const FAMOUS_SPOTS = EQUATION_PRESETS[0].bookmarks;
