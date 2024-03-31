import Plot from "react-plotly.js";
import React, { useEffect, useState } from "react";
import Globe from "./globe";
import styles from "./styles/layouts.module.scss";

interface PlotData {
  x: number[];
  y: number[];
}

interface SimulationData {
  Planet: { x: number; y: number };
  Satellite: { x: number; y: number };
}

const App: React.FC = () => {
  const [plotData, setPlotData] = useState<PlotData[]>([]);
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [showGlobe, setShowGlobe] = useState(true);

  useEffect(() => {
    async function fetchData() {
      console.log("calling fetchdata...");

      try {
        const response = await fetch("data.json");
        const data = await response.json();
        const updatedPlotData: Record<string, PlotData> = {};

        data.forEach(
          ([t0, t1, frame]: [
            number,
            number,
            Record<string, { x: number; y: number }>
          ]) => {
            for (let [agentId, { x, y }] of Object.entries(frame)) {
              if (!updatedPlotData[agentId]) {
                updatedPlotData[agentId] = { x: [], y: [] };
              }
              updatedPlotData[agentId].x.push(x);
              updatedPlotData[agentId].y.push(y);
            }
          }
        );

        setPlotData(Object.values(updatedPlotData));

        console.log("updatedPlotData:", updatedPlotData);

        if (Object.keys(updatedPlotData).length >= 2) {
          const keys = Object.keys(updatedPlotData);
          const planetKey = keys[0];
          const satelliteKey = keys[1];

          const simulationData = updatedPlotData[planetKey].x.map(
            (_, index) => ({
              Planet: {
                x: updatedPlotData[planetKey].x[index],
                y: updatedPlotData[planetKey].y[index],
                z: 0,
              },
              Satellite: {
                x: updatedPlotData[satelliteKey].x[index],
                y: updatedPlotData[satelliteKey].y[index],
                z: 0,
              },
            })
          );

          setSimulationData(simulationData);
        } else {
          console.error("Not enough data for simulation.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  console.log("simulationData:", simulationData);

  return (
    <main className={styles.mainWrapper}>
      <button
        onClick={() => setShowGlobe(!showGlobe)}
        className={styles.mainWrapper__toggleBtn}
      >
        {showGlobe ? "Show Plot" : "Show Globe"}
      </button>
      {showGlobe ? (
        <Globe simulationData={simulationData} />
      ) : (
        <Plot
          className={styles.mainWrapper__plot}
          data={plotData.map((d) => ({ x: d.x, y: d.y }))}
          layout={{
            title: "Visualization",
            yaxis: { scaleanchor: "x" },
            autosize: true,
          }}
        />
      )}
    </main>
  );
};

export default App;
