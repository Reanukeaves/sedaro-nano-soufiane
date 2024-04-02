import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import styles from "./styles/layouts.module.scss";
import { SimulationData } from "./types/interfaces";

const Globe: React.FC<{ simulationData: SimulationData[] }> = ({
  simulationData,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const satelliteRef = useRef<THREE.Mesh | null>(null);
  const trajectoryRef = useRef<THREE.Line | null>(null);

  const [planetPosition, setPlanetPosition] = useState({ x: 0, y: 0, z: 0 });
  const [satellitePosition, setSatellitePosition] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#001c00");

    const camera = new THREE.PerspectiveCamera(
      55,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.2,
      1000
    );
    camera.position.z = 3;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const earthMaterial = new THREE.MeshBasicMaterial({
      color: "#0BFE0C",
      wireframe: true,
      wireframeLinewidth: 1,
    });
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.375, 16, 16),
      earthMaterial
    );
    scene.add(earth);
    earthRef.current = earth;

    const satelliteMaterial = new THREE.MeshBasicMaterial({
      color: "#0BFE0C",
      wireframe: true,
    });
    const satellite = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      satelliteMaterial
    );
    scene.add(satellite);
    satelliteRef.current = satellite;

    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);

    const trajectoryMaterial = new THREE.LineDashedMaterial({
      color: "#007200",
      dashSize: 0.02,
      gapSize: 0.02,
      linewidth: 1,
    });
    const trajectoryGeometry = new THREE.BufferGeometry();
    const trajectory = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
    scene.add(trajectory);
    trajectoryRef.current = trajectory;

    camera.position.z = 3;

    const animate = () => {
      requestAnimationFrame(animate);

      if (!simulationData || simulationData.length === 0) {
        //console.error("Simulation data not loaded or is empty");
        return;
      }

      const totalLength = simulationData.length;
      const currentTime = (Date.now() / 1000) % totalLength;
      const currentIndex = Math.floor(currentTime);
      const nextIndex = (currentIndex + 1) % totalLength;

      const frame = simulationData[currentIndex];
      const nextFrame = simulationData[nextIndex] || simulationData[0]; // loop to start

      const interpolationFactor = currentTime % 1;

      if (frame && frame.Planet && frame.Satellite) {
        const interpolatedPlanet = {
          x: THREE.MathUtils.lerp(
            frame.Planet.x,
            nextFrame.Planet.x,
            interpolationFactor
          ),
          y: THREE.MathUtils.lerp(
            frame.Planet.y,
            nextFrame.Planet.y,
            interpolationFactor
          ),
          z: THREE.MathUtils.lerp(
            frame.Planet.z || 0,
            nextFrame.Planet.z || 0,
            interpolationFactor
          ),
        };

        // Interpolate satellite positions
        const interpolatedSatellite = {
          x: THREE.MathUtils.lerp(
            frame.Satellite.x,
            nextFrame.Satellite.x,
            interpolationFactor
          ),
          y: THREE.MathUtils.lerp(
            frame.Satellite.y,
            nextFrame.Satellite.y,
            interpolationFactor
          ),
          z: THREE.MathUtils.lerp(
            frame.Satellite.z || 0,
            nextFrame.Satellite.z || 0,
            interpolationFactor
          ),
        };

        earthRef.current?.position.set(
          interpolatedPlanet.x,
          interpolatedPlanet.y,
          interpolatedPlanet.z
        );
        satelliteRef.current?.position.set(
          interpolatedSatellite.x,
          interpolatedSatellite.y,
          interpolatedSatellite.z
        );

        setPlanetPosition(interpolatedPlanet);
        setSatellitePosition(interpolatedSatellite);
      }

      earthRef.current?.rotateY(0.003);

      if (trajectoryRef.current) {
        let points = simulationData
          .slice(currentIndex, totalLength)
          .map(
            (data) =>
              new THREE.Vector3(
                data.Satellite.x,
                data.Satellite.y,
                data.Satellite.z || 0
              )
          );

        // If the current index is at the end of the dataset, we start adding points from the beginning
        if (currentIndex >= totalLength - 10) {
          const wrapAroundCount = 10 - (totalLength - currentIndex);
          const additionalPoints = simulationData
            .slice(0, wrapAroundCount)
            .map(
              (data) =>
                new THREE.Vector3(
                  data.Satellite.x,
                  data.Satellite.y,
                  data.Satellite.z || 0
                )
            );
          points = points.concat(additionalPoints);
        }

        trajectoryRef.current.geometry.setFromPoints(points);
        trajectoryRef.current.geometry.computeBoundingSphere();
        trajectoryRef.current.computeLineDistances();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [simulationData]);

  return (
    <section className={styles.mainWrapper__sim}>
      <div className={styles.mainWrapper__sim__coordinatesDisplay}>
        <h3>Planet Position</h3>
        <p>x: {planetPosition.x.toFixed(2)}</p>
        <p>y: {planetPosition.y.toFixed(2)}</p>
        <h3>Satellite Position</h3>
        <p>x: {satellitePosition.x.toFixed(2)}</p>
        <p>y: {satellitePosition.y.toFixed(2)}</p>
      </div>
      <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />
    </section>
  );
};

export default Globe;
