// import { useGraphState } from "../lib/useGraphState";
import ReactFlow, { Controls, Background, BackgroundVariant } from "reactflow";
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
      <Background
        color="#f0f0f0"
        style={{ backgroundColor: "#f7f7f7" }}
        variant={BackgroundVariant.Lines}
      />
      <Controls />
    </ReactFlow>
  );
}
