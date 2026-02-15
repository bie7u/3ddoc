import type { ProjectData } from '../types';

export const sampleProject: ProjectData = {
  id: 'sample-project-1',
  name: 'Sample Assembly Instructions',
  steps: [
    {
      id: 'step-1',
      title: 'Introduction',
      description: 'Welcome to this 3D assembly tutorial. We will guide you through each step.',
      modelPath: 'box', // Using procedural geometry
      cameraPosition: { x: 5, y: 5, z: 5, targetX: 0, targetY: 0, targetZ: 0 },
      highlightColor: '#4299e1',
    },
    {
      id: 'step-2',
      title: 'Identify Components',
      description: 'First, identify all the components you will need for assembly.',
      modelPath: 'box',
      cameraPosition: { x: 3, y: 4, z: 6, targetX: 0, targetY: 0, targetZ: 0 },
      highlightColor: '#48bb78',
    },
    {
      id: 'step-3',
      title: 'Assembly',
      description: 'Begin the assembly process by connecting the main components.',
      modelPath: 'box',
      cameraPosition: { x: -4, y: 3, z: 5, targetX: 0, targetY: 0, targetZ: 0 },
      highlightColor: '#ed8936',
    },
    {
      id: 'step-4',
      title: 'Final Check',
      description: 'Review the assembled product and ensure all parts are secure.',
      modelPath: 'box',
      cameraPosition: { x: 2, y: 6, z: 4, targetX: 0, targetY: 0, targetZ: 0 },
      highlightColor: '#9f7aea',
    },
  ],
  connections: [
    { id: 'e1-2', source: 'step-1', target: 'step-2' },
    { id: 'e2-3', source: 'step-2', target: 'step-3' },
    { id: 'e3-4', source: 'step-3', target: 'step-4' },
  ],
};
