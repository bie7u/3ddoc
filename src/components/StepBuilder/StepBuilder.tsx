import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  Background,
  Controls,
  type Connection,
  useNodesState,
  useEdgesState,
  type NodeProps,
  type EdgeChange,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAppStore } from '../../store';
import type { InstructionStep } from '../../types';

// Custom node component
const StepNode = ({ data, selected }: NodeProps<InstructionStep>) => {
  const substepCount = data.substeps?.length || 0;
  
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-lg min-w-[200px] ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="font-bold text-sm mb-1 flex items-center justify-between">
        <span>{data.title}</span>
        {substepCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {substepCount} substep{substepCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-600 line-clamp-2">{data.description}</div>
      <div
        className="mt-2 h-2 rounded"
        style={{ backgroundColor: data.highlightColor || '#4299e1' }}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  stepNode: StepNode,
};

export const StepBuilder = () => {
  const { project, updateConnections, setSelectedStepId } = useAppStore();
  
  // Convert project steps to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!project) return [];
    
    return project.steps.map((step, index) => ({
      id: step.id,
      type: 'stepNode',
      position: { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 150 },
      data: step,
    }));
  }, [project]);

  const initialEdges: Edge[] = useMemo(() => {
    return project?.connections || [];
  }, [project]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when project steps change
  useEffect(() => {
    if (project) {
      const updatedNodes = project.steps.map((step) => {
        const existingNode = nodes.find(n => n.id === step.id);
        return {
          id: step.id,
          type: 'stepNode',
          position: existingNode?.position || { x: 100, y: 100 },
          data: step,
        };
      });
      setNodes(updatedNodes);
    }
  }, [project?.steps, setNodes]);

  // Update edges when connections change
  useEffect(() => {
    if (project) {
      setEdges(project.connections);
    }
  }, [project?.connections, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(connection, edges);
      setEdges(newEdges);
      updateConnections(newEdges);
    },
    [edges, updateConnections, setEdges]
  );

  const onEdgesChange_ = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      // Update store after edge changes (e.g., deletions)
      setTimeout(() => {
        updateConnections(edges);
      }, 0);
    },
    [onEdgesChange, edges, updateConnections]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedStepId(node.id);
    },
    [setSelectedStepId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedStepId(null);
  }, [setSelectedStepId]);

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange_}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
