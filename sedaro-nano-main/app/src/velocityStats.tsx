import React, { useEffect, useState } from "react";
import { SimulationData } from "./types/interfaces";

interface VelocityStatsProps {
  simulationData: SimulationData[];
}

const VelocityStats: React.FC<VelocityStatsProps> = ({ simulationData }) => {
  const [velocityStats, setVelocityStats] = useState({
    averageVelocity: 0,
    maxVelocity: 0,
    minVelocity: Infinity,
  });

  //Scaling factor to convert simulation velocity units to km/s
  //I'm scaling this based on the max observed simulation velocity (0.145) to a typical LEO velocity ~7.8 km/s (per my google search)
  const scalingFactor = 53.79;

  useEffect(() => {
    if (simulationData.length > 1) {
      let totalVelocity = 0;
      let maxVelocity = 0;
      let minVelocity = Infinity;

      for (let i = 1; i < simulationData.length; i++) {
        const previous = simulationData[i - 1];
        const current = simulationData[i];

        const dx = current.Satellite.x - previous.Satellite.x;
        const dy = current.Satellite.y - previous.Satellite.y;
        const dz = (current.Satellite.z || 0) - (previous.Satellite.z || 0);

        const velocity = Math.sqrt(dx * dx + dy * dy + dz * dz) * scalingFactor;

        if (!isNaN(velocity)) {
          totalVelocity += velocity;
          maxVelocity = Math.max(maxVelocity, velocity);
          minVelocity = Math.min(minVelocity, velocity);
        }
      }

      const averageVelocity = totalVelocity / (simulationData.length - 1);

      setVelocityStats({
        averageVelocity,
        maxVelocity,
        minVelocity,
      });
    }
  }, [simulationData]);

  return (
    <div>
      <h3>Satellite Velocity</h3>
      <p>Avg. : {velocityStats.averageVelocity.toFixed(3)} km/s</p>
      <p>Max : {velocityStats.maxVelocity.toFixed(3)} km/s</p>
      <p>Min : {velocityStats.minVelocity.toFixed(3)} km/s</p>
    </div>
  );
};

export default VelocityStats;
