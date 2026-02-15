import type { Edge } from 'reactflow';
import type { InstructionStep } from '../types';

interface LayoutPosition {
  x: number;
  y: number;
  z: number;
  depth: number;
}

/**
 * Calculates a hierarchical layout for steps based on their connections.
 * Steps in parallel branches are positioned side-by-side.
 */
export const calculateHierarchicalLayout = (
  steps: InstructionStep[],
  connections: Edge[]
): Map<string, LayoutPosition> => {
  const positions = new Map<string, LayoutPosition>();
  
  if (steps.length === 0) {
    return positions;
  }

  // Build adjacency lists for graph traversal
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  
  connections.forEach(edge => {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);
    outgoing.get(edge.source)!.push(edge.target);
    incoming.get(edge.target)!.push(edge.source);
  });

  // Find root nodes (nodes with no incoming edges)
  const roots = steps.filter(step => !incoming.has(step.id) || incoming.get(step.id)!.length === 0);
  
  // If no roots found (cyclic graph or all connected), use first step as root
  if (roots.length === 0) {
    roots.push(steps[0]);
  }

  // Assign depth levels using BFS
  const depths = new Map<string, number>();
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [];
  
  roots.forEach(root => {
    queue.push({ id: root.id, depth: 0 });
    visited.add(root.id);
  });

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    depths.set(id, depth);

    const children = outgoing.get(id) || [];
    children.forEach(childId => {
      if (!visited.has(childId)) {
        visited.add(childId);
        queue.push({ id: childId, depth: depth + 1 });
      } else {
        // Update depth if we found a longer path
        const currentDepth = depths.get(childId) || 0;
        if (depth + 1 > currentDepth) {
          depths.set(childId, depth + 1);
          // Re-queue to update descendants
          queue.push({ id: childId, depth: depth + 1 });
        }
      }
    });
  }

  // Assign depths to unvisited nodes (disconnected components)
  steps.forEach(step => {
    if (!depths.has(step.id)) {
      depths.set(step.id, 0);
    }
  });

  // Group nodes by depth level
  const levelGroups = new Map<number, string[]>();
  depths.forEach((depth, id) => {
    if (!levelGroups.has(depth)) {
      levelGroups.set(depth, []);
    }
    levelGroups.get(depth)!.push(id);
  });

  // Calculate positions
  const horizontalSpacing = 4;
  const depthSpacing = 5;

  levelGroups.forEach((nodeIds, depth) => {
    const nodeCount = nodeIds.length;
    
    // For nodes at the same depth, position them side by side
    nodeIds.forEach((nodeId, index) => {
      const z = -depth * depthSpacing; // Depth in z-axis
      
      // Calculate horizontal offset for parallel nodes
      let x = 0;
      if (nodeCount > 1) {
        // Center the group
        const totalWidth = (nodeCount - 1) * horizontalSpacing;
        x = index * horizontalSpacing - totalWidth / 2;
      }
      
      // Slight vertical variation to avoid complete overlap in some views
      const y = 0;
      
      positions.set(nodeId, { x, y, z, depth });
    });
  });

  return positions;
};
