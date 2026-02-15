import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { InstructionStep, ConnectionStyle } from '../../types';
import type { ProjectData } from '../../types';
import { calculateHierarchicalLayout } from '../../utils/layoutCalculator';

interface ConnectionWithIndices {
  sourceIndex: number;
  targetIndex: number;
  style: ConnectionStyle;
}

interface StepCubeProps {
  step: InstructionStep;
  position: [number, number, number];
  isActive: boolean;
}

// Individual step cube component
const StepCube = ({ step, position, isActive }: StepCubeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Gentle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
    
    // Pulsing glow effect for active step
    if (glowRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  const color = step.highlightColor || '#4299e1';

  return (
    <group position={position}>
      {/* Main cube */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color={color} 
          emissive={isActive ? color : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>
      
      {/* Glowing outline for active step */}
      {isActive && (
        <mesh ref={glowRef}>
          <boxGeometry args={[2.3, 2.3, 2.3]} />
          <meshBasicMaterial 
            color={color}
            transparent 
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};

interface ConnectionTubeProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  isActive: boolean;
  style?: 'standard' | 'glass' | 'glow' | 'neon';
}

// Connection tube between steps
const ConnectionTube = ({ startPos, endPos, isActive, style = 'standard' }: ConnectionTubeProps) => {
  const tubeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Memoize the path to avoid recreating on every render
  const path = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(...startPos),
      new THREE.Vector3(...endPos),
    ]);
  }, [startPos, endPos]);

  // Animate glow effect for glow and neon styles
  useFrame((state) => {
    if (glowRef.current && (style === 'glow' || style === 'neon')) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      if (material.opacity !== undefined) {
        material.opacity = pulse * (isActive ? 0.6 : 0.3);
      }
    }
  });

  // Style-specific rendering
  const renderByStyle = () => {
    switch (style) {
      case 'glass':
        return (
          <>
            <mesh ref={tubeRef}>
              <tubeGeometry args={[path, 20, 0.15, 8, false]} />
              <meshPhysicalMaterial 
                color={isActive ? '#60a5fa' : '#93c5fd'}
                transparent
                opacity={0.4}
                metalness={0.1}
                roughness={0.1}
                transmission={0.9}
                thickness={0.5}
              />
            </mesh>
            {/* Outer glow for glass */}
            <mesh>
              <tubeGeometry args={[path, 20, 0.18, 8, false]} />
              <meshBasicMaterial 
                color="#60a5fa"
                transparent 
                opacity={isActive ? 0.2 : 0.1}
              />
            </mesh>
          </>
        );
      
      case 'glow':
        return (
          <>
            <mesh ref={tubeRef}>
              <tubeGeometry args={[path, 20, 0.12, 8, false]} />
              <meshStandardMaterial 
                color={isActive ? '#fbbf24' : '#fcd34d'}
                emissive="#fbbf24"
                emissiveIntensity={isActive ? 1.5 : 0.8}
              />
            </mesh>
            {/* Outer glow effect */}
            <mesh ref={glowRef}>
              <tubeGeometry args={[path, 20, 0.25, 8, false]} />
              <meshBasicMaterial 
                color="#fbbf24"
                transparent 
                opacity={isActive ? 0.4 : 0.2}
              />
            </mesh>
          </>
        );
      
      case 'neon':
        return (
          <>
            <mesh ref={tubeRef}>
              <tubeGeometry args={[path, 20, 0.1, 8, false]} />
              <meshStandardMaterial 
                color={isActive ? '#ec4899' : '#f472b6'}
                emissive={isActive ? '#ec4899' : '#f472b6'}
                emissiveIntensity={2}
              />
            </mesh>
            {/* Neon glow layers */}
            <mesh ref={glowRef}>
              <tubeGeometry args={[path, 20, 0.2, 8, false]} />
              <meshBasicMaterial 
                color="#ec4899"
                transparent 
                opacity={0.5}
              />
            </mesh>
            <mesh>
              <tubeGeometry args={[path, 20, 0.3, 8, false]} />
              <meshBasicMaterial 
                color="#ec4899"
                transparent 
                opacity={isActive ? 0.2 : 0.1}
              />
            </mesh>
          </>
        );
      
      case 'standard':
      default:
        return (
          <mesh ref={tubeRef}>
            <tubeGeometry args={[path, 20, 0.15, 8, false]} />
            <meshStandardMaterial 
              color={isActive ? '#60a5fa' : '#4b5563'}
              emissive={isActive ? '#3b82f6' : '#000000'}
              emissiveIntensity={isActive ? 0.5 : 0}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        );
    }
  };

  return <group>{renderByStyle()}</group>;
};

interface UnifiedModelProps {
  project: ProjectData;
  currentStepId: string | null;
}

// Unified model containing all steps
const UnifiedModel = ({ project, currentStepId }: UnifiedModelProps) => {
  const steps = project.steps;
  
  // Calculate hierarchical layout positions
  const layout = useMemo(() => {
    return calculateHierarchicalLayout(steps, project.connections);
  }, [steps, project.connections]);
  
  // Convert layout to position array, preserving step order
  const positions: [number, number, number][] = useMemo(() => {
    return steps.map(step => {
      const pos = layout.get(step.id);
      return pos ? [pos.x, pos.y, pos.z] : [0, 0, 0];
    });
  }, [steps, layout]);

  // Memoize connections calculation with optimized lookups
  const connections = useMemo(() => {
    // Create a map for fast step ID to index lookup
    const stepIdToIndex = new Map(steps.map((s, i) => [s.id, i]));
    
    return project.connections
      .map(conn => {
        const sourceIndex = stepIdToIndex.get(conn.source);
        const targetIndex = stepIdToIndex.get(conn.target);
        return sourceIndex !== undefined && targetIndex !== undefined
          ? { sourceIndex, targetIndex, style: conn.data?.style || 'standard' as ConnectionStyle }
          : null;
      })
      .filter((c): c is ConnectionWithIndices => c !== null);
  }, [project.connections, steps]);

  // Check if connection is active (involves current step)
  const isConnectionActive = (sourceIndex: number, targetIndex: number) => {
    if (!currentStepId) return false;
    const currentIndex = steps.findIndex(s => s.id === currentStepId);
    return sourceIndex === currentIndex || targetIndex === currentIndex;
  };

  return (
    <group>
      {/* Render all step cubes */}
      {steps.map((step, index) => (
        <StepCube
          key={step.id}
          step={step}
          position={positions[index]}
          isActive={step.id === currentStepId}
        />
      ))}
      
      {/* Render connection tubes */}
      {connections.map((conn, index) => (
        <ConnectionTube
          key={index}
          startPos={positions[conn.sourceIndex]}
          endPos={positions[conn.targetIndex]}
          isActive={isConnectionActive(conn.sourceIndex, conn.targetIndex)}
          style={conn.style}
        />
      ))}
    </group>
  );
};

interface CameraControllerProps {
  project: ProjectData;
  currentStepId: string | null;
}

// Component to smoothly transition camera to focus on current step
const CameraController = ({ project, currentStepId }: CameraControllerProps) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  // Memoize layout calculation
  const layout = useMemo(() => {
    return calculateHierarchicalLayout(project.steps, project.connections);
  }, [project.steps, project.connections]);

  useEffect(() => {
    if (!currentStepId || !project) {
      // Default camera position to see all cubes
      targetPos.current.set(0, 8, 12);
      targetLookAt.current.set(0, 0, -5);
      return;
    }

    const currentStep = project.steps.find(s => s.id === currentStepId);
    if (!currentStep) {
      targetPos.current.set(0, 8, 12);
      targetLookAt.current.set(0, 0, -5);
      return;
    }

    // Get position of current step from memoized layout
    const stepPos = layout.get(currentStepId);
    
    if (!stepPos) {
      targetPos.current.set(0, 8, 12);
      targetLookAt.current.set(0, 0, -5);
      return;
    }
    
    // Position camera to focus on current cube but keep context visible
    const cameraDistance = 8;
    const cameraHeight = 5;
    
    targetPos.current.set(stepPos.x + cameraDistance * 0.5, cameraHeight, stepPos.z + cameraDistance);
    targetLookAt.current.set(stepPos.x, stepPos.y, stepPos.z);
  }, [currentStepId, project, layout]);

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
  project: ProjectData | null;
  currentStepId: string | null;
  isPreviewMode?: boolean;
}

export const Viewer3D = ({ project, currentStepId, isPreviewMode = false }: Viewer3DProps) => {
  const currentStep = project?.steps.find(s => s.id === currentStepId);
  
  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 8, 12]} />
        {project && (
          <CameraController 
            project={project}
            currentStepId={currentStepId}
          />
        )}
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Unified 3D Model with all steps */}
        {project && (
          <UnifiedModel 
            project={project}
            currentStepId={currentStepId}
          />
        )}
        
        {/* Grid helper */}
        <gridHelper args={[20, 20]} />
        
        {/* Controls - disabled in preview mode to allow camera tracking */}
        {!isPreviewMode && <OrbitControls enableDamping dampingFactor={0.05} />}
      </Canvas>
      
      {/* Overlay info */}
      {currentStep && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg max-w-md">
          <h3 className="text-lg font-bold mb-2">{currentStep.title}</h3>
          <p className="text-sm">{currentStep.description}</p>
        </div>
      )}
    </div>
  );
};
