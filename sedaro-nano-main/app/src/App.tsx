import Plot from "react-plotly.js";
import React, { useEffect, useState } from "react";

interface PlotData {
  x: number[];
  y: number[];
}

const App: React.FC = () => {
  // Store plot data in state.
  const [plotData, setPlotData] = useState<PlotData[]>([]);

  useEffect(() => {
    // fetch plot data when the component mounts
    async function fetchData() {
      console.log("calling fetchdata...");

      try {
        // 'data.json' should be populated from a run of sim.py
        const response = await fetch("data.json");
        const data: [
          number,
          number,
          Record<string, { x: number; y: number }>
        ][] = await response.json();
        const updatedPlotData: Record<string, PlotData> = {};

        data.forEach(([t0, t1, frame]) => {
          for (let [agentId, { x, y }] of Object.entries(frame)) {
            updatedPlotData[agentId] = updatedPlotData[agentId] || {
              x: [],
              y: [],
            };
            updatedPlotData[agentId].x.push(x);
            updatedPlotData[agentId].y.push(y);
          }
        });

        setPlotData(Object.values(updatedPlotData));
        console.log("plotData:", Object.values(updatedPlotData));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <Plot
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
      }}
      data={plotData.map((d) => ({ x: d.x, y: d.y }))}
      layout={{
        title: "Visualization",
        yaxis: { scaleanchor: "x" },
        autosize: true,
      }}
    />
  );
};

export default App;
