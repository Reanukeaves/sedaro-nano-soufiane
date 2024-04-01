export interface PlotData {
  x: number[];
  y: number[];
}

export interface SimulationData {
    Planet: { x: number; y: number; z?: number };
    Satellite: { x: number; y: number; z?: number };
  }
