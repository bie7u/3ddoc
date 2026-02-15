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
  substeps?: InstructionStep[];
  parentId?: string;
}

export interface ProjectData {
  id: string;
  name: string;
  steps: InstructionStep[];
  connections: Edge[];
}

export type StepNode = Node<InstructionStep>;
