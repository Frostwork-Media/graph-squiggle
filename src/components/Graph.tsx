import { useGraphState, useWatchSquiggle } from "../lib/useGraphState";
import ReactFlow, {
  Controls,
  Handle,
  Position,
  NodeProps,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { squiggleNodeType } from "../lib/constants";

const newLocal = {
  [squiggleNodeType]: TextUpdaterNode,
};
export function Graph() {
  useWatchSquiggle();
  const nodes = useGraphState((state) => state.nodes);
  const edges = useGraphState((state) => state.edges);

  return (
    <ReactFlow fitView nodes={nodes} edges={edges} nodeTypes={newLocal}>
      <Controls />
    </ReactFlow>
  );
}

function TextUpdaterNode({ data }: NodeProps) {
  return (
    <>
      <Handle type="source" position={Position.Top} />
      <div className="overflow-hidden">
        <Chip label={data.label} />
      </div>
      <Handle type="target" position={Position.Bottom} />
    </>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <div className="bg-gray-200 rounded-full inline-block px-3 py-1 text-xs text-gray-700 mr-2 max-w-full font-mono overflow-hidden whitespace-nowrap overflow-ellipsis">
      {label}
    </div>
  );
}
