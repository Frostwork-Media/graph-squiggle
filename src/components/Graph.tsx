// import { useGraphState } from "../lib/useGraphState";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import { useGraphState } from "../lib/completeGraphDataFromSquiggleState";
import { nodeTypes } from "../lib/constants";

export function Graph() {
  const nodes = useGraphState((state) => state.nodes);
  const edges = useGraphState((state) => state.edges);

  return (
    <ReactFlow fitView nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
      <Background />
      <Controls />
    </ReactFlow>
  );
}

export function Chip({ label }: { label: string }) {
  return (
    <div className="bg-blue-50 rounded-lg inline-block p-1 px-2 text-[10px] text-blue-400 mr-2 max-w-full font-mono overflow-hidden whitespace-nowrap overflow-ellipsis">
      {label}
    </div>
  );
}
