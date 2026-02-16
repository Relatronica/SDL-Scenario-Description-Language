import { useCallback } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnSelectionChangeParams,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from './nodes/SDLNodes';

interface FlowCanvasProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodeSelect: (nodeId: string | null) => void;
}

export default function FlowCanvas({ initialNodes, initialEdges, onNodeSelect }: FlowCanvasProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 1) {
        onNodeSelect(selectedNodes[0].id);
      } else {
        onNodeSelect(null);
      }
    },
    [onNodeSelect],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onSelectionChange={onSelectionChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3, minZoom: 0.5, maxZoom: 1.2 }}
      minZoom={0.3}
      maxZoom={2}
      defaultEdgeOptions={{
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'rgb(71, 85, 105)', strokeWidth: 2 },
      }}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1}
        color="rgb(30, 41, 59)"
      />
      <Controls
        showInteractive={false}
        position="bottom-left"
      />
      <MiniMap
        nodeStrokeWidth={3}
        nodeColor={(node) => node.data?.color ?? '#64748b'}
        maskColor="rgba(15, 23, 42, 0.8)"
        position="bottom-right"
        style={{ width: 150, height: 100 }}
      />
    </ReactFlow>
  );
}
