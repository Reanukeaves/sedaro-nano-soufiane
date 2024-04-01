import Plot from "react-plotly.js";
import React, { useEffect, useState } from "react";
import Globe from "./globe";
import styles from "./styles/layouts.module.scss";
import { PlotData, SimulationData } from "./types/interfaces";
import variables from "./styles/utils.module.scss";

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
  const buttonClass = (isActive: boolean) =>
    `${styles.mainWrapper__toggleBtn} ${isActive ? styles.active : ""}`;
  return (
    <main className={styles.mainWrapper}>
      <nav className={styles.mainWrapper__buttons}>
        <button
          onClick={() => setShowGlobe(true)}
          className={buttonClass(showGlobe)}
        >
          Show Globe
        </button>
        <button
          onClick={() => setShowGlobe(false)}
          className={buttonClass(!showGlobe)}
        >
          Show Plot
        </button>
      </nav>
      {showGlobe ? (
        <Globe simulationData={simulationData} />
      ) : (
        <Plot
          className={styles.mainWrapper__plot}
          data={plotData.map((d) => ({ x: d.x, y: d.y }))}
          layout={{
            title: "Visualization",
            yaxis: { scaleanchor: "x", color: variables.lightGreen },
            autosize: true,
            plot_bgcolor: variables.dark,
            paper_bgcolor: variables.dark,
            font: { color: variables.lightGreen },
            xaxis: { color: variables.lightGreen },
            // change the color of the curve
            line: { color: variables.lightGreen },
          }}
        />
      )}
    </main>
  );
};

export default App;
