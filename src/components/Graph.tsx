import { useGraphState, useWatchSquiggle } from "../lib/useGraphState";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { squiggleNodeType } from "../lib/constants";

export function Graph() {
  useWatchSquiggle();
  const nodes = useGraphState((state) => state.nodes);
  const edges = useGraphState((state) => state.edges);
  return (
    <div style={{ height: 600 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{
          [squiggleNodeType]: TextUpdaterNode,
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function TextUpdaterNode({ data }: NodeProps) {
  return (
    <>
      <Handle type="source" position={Position.Top} />
      <div>
        <h1>{data.label}</h1>
      </div>
      <Handle type="target" position={Position.Bottom} />
    </>
  );
}
