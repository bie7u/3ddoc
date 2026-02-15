import type { Node, Edge } from 'reactflow';

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
  targetX?: number;
  targetY?: number;
  targetZ?: number;
}

export interface Annotation {
  id: string;
  position: [number, number, number];
  text: string;
}

export interface InstructionStep {
  id: string;
  title: string;
  description: string;
  modelPath: string;
  cameraPosition: CameraPosition;
  annotations?: Annotation[];
  highlightColor?: string;
}

export type EdgeStyle = 'default' | 'glow' | 'glass' | 'dashed';

export interface StepEdgeData {
  style?: EdgeStyle;
}

export type StepEdge = Edge<StepEdgeData>;

export interface ProjectData {
  id: string;
  name: string;
  steps: InstructionStep[];
  connections: StepEdge[];
}

export type StepNode = Node<InstructionStep>;
