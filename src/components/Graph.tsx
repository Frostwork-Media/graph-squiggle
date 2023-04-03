import { useGraphState, useWatchSquiggle } from "../lib/useGraphState";
import ReactFlow, {
  Controls,
  Handle,
  Position,
  NodeProps,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import { squiggleNodeType } from "../lib/constants";

const nodeTypes = {
  [squiggleNodeType]: CustomNode,
};

export function Graph() {
  useWatchSquiggle();
  const nodes = useGraphState((state) => state.nodes);
  const edges = useGraphState((state) => state.edges);

  return (
    <ReactFlow fitView nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
      <Background />
      <Controls />
    </ReactFlow>
  );
}

function CustomNode({ data }: NodeProps) {
  return (
    <>
      <Handle type="source" position={Position.Top} />
      <div className="bg-white grid grid-rows-[auto_minmax(0,1fr)] h-full border border-neutral-300 p-1 rounded-xl border-b-8">
        <div className="overflow-hidden">
          <Chip label={data.label} />
        </div>
        {/* <span>{data.line}</span> */}
        <div className="grid content-center justify-center pb-4 px-2">
          <span className="text-sm text-center">{data.comment}</span>
        </div>
      </div>
      <Handle type="target" position={Position.Bottom} />
    </>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <div className="bg-blue-50 rounded-lg inline-block p-1 px-2 text-[10px] text-blue-400 mr-2 max-w-full font-mono overflow-hidden whitespace-nowrap overflow-ellipsis">
      {label}
    </div>
  );
}
