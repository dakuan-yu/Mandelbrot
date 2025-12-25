
export interface ViewPort {
  centerX: number;
  centerY: number;
  zoom: number;
}

export interface FractalConfig {
  maxIterations: number;
  colorPalette: string;
  realEquation: string;
  imagEquation: string;
}

export interface FractalSpot {
  name: string;
  x: number;
  y: number;
  zoom: number;
  description: string;
}
