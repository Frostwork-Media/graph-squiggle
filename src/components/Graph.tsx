// import { useGraphState } from "../lib/useGraphState";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  OnNodesChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { useGraphState } from "../lib/completeGraphDataFromSquiggleState";
import { nodeTypes } from "../lib/constants";
import {
  preferCustomNodeLocation,
  useNodeLocation,
} from "../lib/useNodeLocation";

export function Graph() {
  const nodes = useGraphState((state) => state.nodes);
  const edges = useGraphState((state) => state.edges);
  const nodeLocation = useNodeLocation();
  const _nodes = preferCustomNodeLocation(nodes, nodeLocation);

  return (
    <ReactFlow
      fitView
      nodes={_nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      minZoom={0.2}
      maxZoom={2}
      onNodesChange={onNodesChange}
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

const onNodesChange: OnNodesChange = (changes) => {
  for (const change of changes) {
    if (change.type === "position" && change.position) {
      useNodeLocation.setState({
        [change.id]: { x: change.position.x, y: change.position.y },
      });
    }
  }
};
