// import { useGraphState } from "../lib/useGraphState";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import { useGraphState } from "../lib/completeGraphDataFromSquiggleState";
import { nodeTypes } from "../lib/constants";

export function Graph() {
  const nodes = useGraphState((state) => state.nodes);
  const edges = useGraphState((state) => state.edges);

  return (
    <ReactFlow
      fitView
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      minZoom={0.2}
      maxZoom={2}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
