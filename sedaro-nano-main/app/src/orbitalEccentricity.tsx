import React, { useEffect, useState } from "react";
import { SimulationData } from "./types/interfaces";

interface OrbitalEccentricityProps {
  simulationData: SimulationData[];
}

const OrbitalEccentricity: React.FC<OrbitalEccentricityProps> = ({
  simulationData,
}) => {
  const [eccentricity, setEccentricity] = useState<number>(0);

  useEffect(() => {
    const calculateEccentricity = (data: any) => {
      const distances = data.map((frame: any) => {
        const planetX = typeof frame.Planet.x === "number" ? frame.Planet.x : 0;
        const planetY = typeof frame.Planet.y === "number" ? frame.Planet.y : 0;
        const planetZ = typeof frame.Planet.z === "number" ? frame.Planet.z : 0;
        const satelliteX =
          typeof frame.Satellite.x === "number" ? frame.Satellite.x : 0;
        const satelliteY =
          typeof frame.Satellite.y === "number" ? frame.Satellite.y : 0;
        const satelliteZ =
          typeof frame.Satellite.z === "number" ? frame.Satellite.z : 0;

        const dx = satelliteX - planetX;
        const dy = satelliteY - planetY;
        const dz = satelliteZ - planetZ;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (isNaN(distance)) {
          console.warn("Calculated distance is NaN", { dx, dy, dz, frame });
        }

        return distance;
      });

      if (distances.some(isNaN)) {
        console.warn("Distances array contains NaN", distances);
      }

      const ra = Math.max(...distances);
      const rp = Math.min(...distances);

      if (isNaN(ra) || isNaN(rp)) {
        console.warn("ra or rp is NaN", { ra, rp, distances });
        return 0;
      }

      return (ra - rp) / (ra + rp);
    };

    if (simulationData.length > 0) {
      const e = calculateEccentricity(simulationData);
      setEccentricity(e);
    }
  }, [simulationData]);

  return (
    <div>
      <h3>Orbital Eccentricity</h3>
      <p>{eccentricity.toFixed(3)}</p>
    </div>
  );
};

export default OrbitalEccentricity;
