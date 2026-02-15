import { BaseEdge, type EdgeProps, getSmoothStepPath } from 'reactflow';
import type { StepEdgeData } from '../../types';

// Default Edge - standard smooth step
export const DefaultEdge = (props: EdgeProps<StepEdgeData>) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={props.markerEnd} style={{ stroke: '#b1b1b7', strokeWidth: 2 }} />
    </>
  );
};

// Glowing/Animated Edge
export const GlowEdge = (props: EdgeProps<StepEdgeData>) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <>
      <defs>
        <filter id={`glow-${props.id}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <BaseEdge 
        path={edgePath} 
        markerEnd={props.markerEnd} 
        style={{ 
          stroke: '#4299e1', 
          strokeWidth: 3,
          filter: `url(#glow-${props.id})`,
          animation: 'pulse 2s ease-in-out infinite'
        }} 
      />
    </>
  );
};

// Glass Tube Edge - with double outline effect
export const GlassEdge = (props: EdgeProps<StepEdgeData>) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <>
      <defs>
        <linearGradient id={`glass-gradient-${props.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.8 }} />
          <stop offset="50%" style={{ stopColor: '#a0d8f1', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.8 }} />
        </linearGradient>
      </defs>
      {/* Outer border */}
      <path
        d={edgePath}
        style={{
          stroke: '#5ab9ea',
          strokeWidth: 8,
          fill: 'none',
          opacity: 0.3,
        }}
      />
      {/* Inner tube */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={props.markerEnd} 
        style={{ 
          stroke: `url(#glass-gradient-${props.id})`, 
          strokeWidth: 5,
        }} 
      />
      {/* Inner highlight */}
      <path
        d={edgePath}
        style={{
          stroke: '#ffffff',
          strokeWidth: 2,
          fill: 'none',
          opacity: 0.7,
        }}
      />
    </>
  );
};

// Dashed Edge
export const DashedEdge = (props: EdgeProps<StepEdgeData>) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={props.markerEnd} 
        style={{ 
          stroke: '#9f7aea', 
          strokeWidth: 2.5,
          strokeDasharray: '8 8',
        }} 
      />
    </>
  );
};
