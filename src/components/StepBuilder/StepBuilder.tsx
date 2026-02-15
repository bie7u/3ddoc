import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  type Connection,
  useNodesState,
  useEdgesState,
  type NodeProps,
  type EdgeChange,
  type EdgeProps,
  Handle,
  Position,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAppStore } from '../../store';
import type { InstructionStep, ConnectionData, ConnectionStyle } from '../../types';

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

// Custom edge component with style selector
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps<ConnectionData>) => {
  const { updateConnections, project } = useAppStore();
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  
  const currentStyle = data?.style || 'standard';
  
  const styles: { value: ConnectionStyle; label: string; color: string }[] = [
    { value: 'standard', label: 'Standard', color: '#4b5563' },
    { value: 'glass', label: 'Glass', color: '#60a5fa' },
    { value: 'glow', label: 'Glow', color: '#fbbf24' },
    { value: 'neon', label: 'Neon', color: '#ec4899' },
  ];
  
  const handleStyleChange = (newStyle: ConnectionStyle) => {
    if (!project) return;
    
    const updatedConnections = project.connections.map(conn => 
      conn.id === id 
        ? { ...conn, data: { ...conn.data, style: newStyle } }
        : conn
    );
    
    updateConnections(updatedConnections);
    setShowStyleMenu(false);
  };
  
  const handleDelete = () => {
    if (!project) return;
    
    const updatedConnections = project.connections.filter(conn => conn.id !== id);
    updateConnections(updatedConnections);
  };
  
  const currentStyleInfo = styles.find(s => s.value === currentStyle) || styles[0];
  
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex gap-1"
        >
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="px-2 py-1 text-xs rounded shadow-md hover:shadow-lg transition"
            style={{ 
              backgroundColor: currentStyleInfo.color,
              color: 'white',
            }}
          >
            {currentStyleInfo.label}
          </button>
          
          <button
            onClick={handleDelete}
            className="px-2 py-1 text-xs rounded shadow-md hover:shadow-lg transition bg-red-500 hover:bg-red-600 text-white"
            title="Delete connection"
          >
            ✕
          </button>
          
          {showStyleMenu && (
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-white rounded shadow-lg border border-gray-200 z-10">
              {styles.map(style => (
                <button
                  key={style.value}
                  onClick={() => handleStyleChange(style.value)}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition whitespace-nowrap"
                  style={{
                    backgroundColor: currentStyle === style.value ? '#f3f4f6' : 'white',
                  }}
                >
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: style.color }}
                  />
                  {style.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const nodeTypes = {
  stepNode: StepNode,
};

const edgeTypes = {
  default: CustomEdge,
};

export const StepBuilder = () => {
  const { project, updateConnections, setSelectedStepId, nodePositions, updateNodePosition } = useAppStore();
  
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
      if (!connection.source || !connection.target) return;
      
      const newEdge: Edge<ConnectionData> = {
        id: `e${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        data: { style: 'standard' as ConnectionStyle },
      };
      const newEdges = [...edges, newEdge];
      setEdges(newEdges);
      updateConnections(newEdges);
    },
    [edges, updateConnections, setEdges]
  );

  const onEdgesChange_ = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      // Don't update the store here - let React Flow handle the UI state
      // The store will be updated by explicit actions like handleDelete or onConnect
    },
    [onEdgesChange]
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

  // Save node positions when they change
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

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
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
