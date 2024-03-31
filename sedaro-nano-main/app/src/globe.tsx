import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface SimulationData {
  Planet: { x: number; y: number; z?: number };
  Satellite: { x: number; y: number; z?: number };
}

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

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000814");

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const earthMaterial = new THREE.MeshBasicMaterial({
      color: "#94d2bd",
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
      color: "#ffffff",
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

    new OrbitControls(camera, renderer.domElement);

    const trajectoryMaterial = new THREE.LineDashedMaterial({
      color: "#caf0f8",
      dashSize: 0.02,
      gapSize: 0.02,
      linewidth: 1,
    });
    const trajectoryGeometry = new THREE.BufferGeometry();
    const trajectory = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
    scene.add(trajectory);
    trajectoryRef.current = trajectory;

    camera.position.z = 5 * 0.5;

    const animate = () => {
      requestAnimationFrame(animate);

      if (!simulationData || simulationData.length === 0) {
        //console.error("Simulation data not loaded or is empty");
        return;
      }

      const currentTime = (Date.now() / 1000) % simulationData.length;
      const currentIndex = Math.floor(currentTime);
      const nextIndex = (currentIndex + 1) % simulationData.length;

      const frame = simulationData[currentIndex];
      const nextFrame = simulationData[nextIndex];

      const interpolationFactor = currentTime % 1;

      if (
        frame &&
        frame.Planet &&
        frame.Satellite &&
        nextFrame &&
        nextFrame.Satellite
      ) {
        const interpolatedPlanetX = THREE.MathUtils.lerp(
          frame.Planet.x,
          nextFrame.Planet.x,
          interpolationFactor
        );
        const interpolatedPlanetY = THREE.MathUtils.lerp(
          frame.Planet.y,
          nextFrame.Planet.y,
          interpolationFactor
        );
        const interpolatedPlanetZ = THREE.MathUtils.lerp(
          frame.Planet.z || 0,
          nextFrame.Planet.z || 0,
          interpolationFactor
        );

        const interpolatedSatelliteX = THREE.MathUtils.lerp(
          frame.Satellite.x,
          nextFrame.Satellite.x,
          interpolationFactor
        );
        const interpolatedSatelliteY = THREE.MathUtils.lerp(
          frame.Satellite.y,
          nextFrame.Satellite.y,
          interpolationFactor
        );
        const interpolatedSatelliteZ = THREE.MathUtils.lerp(
          frame.Satellite.z || 0,
          nextFrame.Satellite.z || 0,
          interpolationFactor
        );

        earthRef.current?.position.set(
          interpolatedPlanetX,
          interpolatedPlanetY,
          interpolatedPlanetZ
        );
        satelliteRef.current?.position.set(
          interpolatedSatelliteX,
          interpolatedSatelliteY,
          interpolatedSatelliteZ
        );
      }

      earthRef.current?.rotateY(0.003);

      //update the trajectory to only show the path ahead of the satellite
      if (trajectoryRef.current) {
        const futurePoints = simulationData
          .slice(currentIndex)
          .map(
            (data) =>
              new THREE.Vector3(
                data.Satellite.x,
                data.Satellite.y,
                data.Satellite.z || 0
              )
          );
        trajectoryRef.current.geometry.setFromPoints(futurePoints);
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

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Globe;
