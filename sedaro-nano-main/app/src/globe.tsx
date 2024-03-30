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
    scene.background = new THREE.Color(0xaaaaaa);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      earthMaterial
    );
    scene.add(earth);
    earthRef.current = earth;

    const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const satellite = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 16),
      satelliteMaterial
    );
    scene.add(satellite);
    satelliteRef.current = satellite;

    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

    new OrbitControls(camera, renderer.domElement);

    const trajectoryMaterial = new THREE.LineDashedMaterial({
      color: 0xff0000,
      dashSize: 0.1,
      gapSize: 0.1,
    });
    const trajectoryGeometry = new THREE.BufferGeometry();
    const trajectory = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
    scene.add(trajectory);
    trajectoryRef.current = trajectory;

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      if (!simulationData || simulationData.length === 0) {
        console.error("Simulation data not loaded or is empty");
        return;
      }

      const currentTime = (Date.now() / 1000) % simulationData.length;
      const currentIndex = Math.floor(currentTime);
      const nextIndex = (currentIndex + 1) % simulationData.length;

      const frame = simulationData[currentIndex];
      const nextFrame = simulationData[nextIndex];

      if (frame && nextFrame && frame.Planet && frame.Satellite) {
        const progress = currentTime - currentIndex;

        const interpolatePosition = (
          current: number,
          next: number,
          progress: number
        ): number => {
          return current + (next - current) * progress;
        };

        const satelliteX = interpolatePosition(
          frame.Satellite.x,
          nextFrame.Satellite.x,
          progress
        );
        const satelliteY = interpolatePosition(
          frame.Satellite.y,
          nextFrame.Satellite.y,
          progress
        );
        const satelliteZ = interpolatePosition(
          frame.Satellite.z || 0,
          nextFrame.Satellite.z || 0,
          progress
        );

        satelliteRef.current?.position.set(satelliteX, satelliteY, satelliteZ);
      }

      if (trajectoryRef.current && simulationData.length > 1) {
        const points = simulationData.map(
          (data) =>
            new THREE.Vector3(
              data.Satellite.x,
              data.Satellite.y,
              data.Satellite.z || 0
            )
        );
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

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Globe;
