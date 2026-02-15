import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { InstructionStep } from '../../types';

interface Model3DProps {
  modelPath: string;
  highlightColor?: string;
}

// Simple 3D model component - for MVP we use a box
const Model3D = ({ highlightColor }: Model3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Simple rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const color = highlightColor || '#4299e1';

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

interface CameraControllerProps {
  cameraPosition: InstructionStep['cameraPosition'];
}

// Component to smoothly transition camera
const CameraController = ({ cameraPosition }: CameraControllerProps) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    targetPos.current.set(
      cameraPosition.x,
      cameraPosition.y,
      cameraPosition.z
    );
    
    if (cameraPosition.targetX !== undefined) {
      targetLookAt.current.set(
        cameraPosition.targetX,
        cameraPosition.targetY || 0,
        cameraPosition.targetZ || 0
      );
    }
  }, [cameraPosition]);

  useFrame(() => {
    // Smooth camera movement
    camera.position.lerp(targetPos.current, 0.05);
    
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10);
    currentLookAt.add(camera.position);
    
    currentLookAt.lerp(targetLookAt.current, 0.05);
    camera.lookAt(currentLookAt);
  });

  return null;
};

interface Viewer3DProps {
  step: InstructionStep | null;
}

export const Viewer3D = ({ step }: Viewer3DProps) => {
  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <CameraController 
          cameraPosition={step?.cameraPosition || { x: 5, y: 5, z: 5, targetX: 0, targetY: 0, targetZ: 0 }} 
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* 3D Model */}
        {step && (
          <Model3D 
            modelPath={step.modelPath} 
            highlightColor={step.highlightColor}
          />
        )}
        
        {/* Grid helper */}
        <gridHelper args={[20, 20]} />
        
        {/* Controls */}
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
      
      {/* Overlay info */}
      {step && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg max-w-md">
          <h3 className="text-lg font-bold mb-2">{step.title}</h3>
          <p className="text-sm">{step.description}</p>
        </div>
      )}
    </div>
  );
};
