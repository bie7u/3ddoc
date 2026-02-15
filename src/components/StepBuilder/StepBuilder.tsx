import { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { InstructionStep, EdgeStyle } from '../../types';
import { DefaultEdge, GlowEdge, GlassEdge, DashedEdge } from './CustomEdges';

// Custom node component
const StepNode = ({ data, selected }: NodeProps<InstructionStep>) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-lg min-w-[200px] ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Right} />
      <div className="font-bold text-sm mb-1">{data.title}</div>
      <div className="text-xs text-gray-600 line-clamp-2">{data.description}</div>
      <div
        className="mt-2 h-2 rounded"
        style={{ backgroundColor: data.highlightColor || '#4299e1' }}
      />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const nodeTypes = {
  stepNode: StepNode,
};

const edgeTypes = {
  default: DefaultEdge,
  glow: GlowEdge,
  glass: GlassEdge,
  dashed: DashedEdge,
};

export const StepBuilder = () => {
  const { project, updateConnections, setSelectedStepId, nodePositions, updateNodePosition } = useAppStore();
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [edgeMenuPosition, setEdgeMenuPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Convert project steps to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!project) return [];
    
    return project.steps.map((step, index) => ({
      id: step.id,
      type: 'stepNode',
      position: nodePositions[step.id] || { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 150 },
      data: step,
    }));
  }, [project, nodePositions]);

  const initialEdges: Edge[] = useMemo(() => {
    return (project?.connections || []).map(edge => ({
      ...edge,
      type: edge.data?.style || 'default',
    }));
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
          position: existingNode?.position || nodePositions[step.id] || { x: 100, y: 100 },
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
    setSelectedEdge(null);
    setEdgeMenuPosition(null);
  }, [setSelectedStepId]);

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
      setSelectedStepId(null);
      // Position the menu at the click location relative to viewport
      setEdgeMenuPosition({ x: _event.clientX, y: _event.clientY });
    },
    [setSelectedStepId]
  );

  const changeEdgeStyle = useCallback(
    (style: EdgeStyle) => {
      if (!selectedEdge) return;
      
      const updatedEdges = edges.map((edge) =>
        edge.id === selectedEdge.id
          ? { ...edge, data: { ...edge.data, style }, type: style }
          : edge
      );
      
      setEdges(updatedEdges);
      updateConnections(updatedEdges);
      setSelectedEdge(null);
      setEdgeMenuPosition(null);
    },
    [selectedEdge, edges, setEdges, updateConnections]
  );

  // Save node positions when they change
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  return (
    <div className="w-full h-full bg-gray-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange_}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
      </ReactFlow>
      
      {/* Edge Style Menu */}
      {selectedEdge && edgeMenuPosition && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50"
          style={{
            left: `${edgeMenuPosition.x}px`,
            top: `${edgeMenuPosition.y}px`,
          }}
        >
          <div className="text-xs font-semibold mb-2 text-gray-700">Connection Style</div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => changeEdgeStyle('default')}
              className="px-3 py-1.5 text-xs text-left hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <div className="w-8 h-0.5 bg-gray-400"></div>
              Default
            </button>
            <button
              onClick={() => changeEdgeStyle('glow')}
              className="px-3 py-1.5 text-xs text-left hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <div className="w-8 h-0.5 bg-blue-400 shadow-lg shadow-blue-300"></div>
              Glow
            </button>
            <button
              onClick={() => changeEdgeStyle('glass')}
              className="px-3 py-1.5 text-xs text-left hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <div className="w-8 h-1 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200 rounded"></div>
              Glass Tube
            </button>
            <button
              onClick={() => changeEdgeStyle('dashed')}
              className="px-3 py-1.5 text-xs text-left hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <div className="w-8 h-0.5 border-b-2 border-dashed border-purple-400"></div>
              Dashed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
