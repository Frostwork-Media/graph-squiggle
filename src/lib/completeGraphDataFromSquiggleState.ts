import { SquiggleState } from "./useSquiggleState";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import cytoscape, { ElementsDefinition } from "cytoscape";
import klay from "cytoscape-klay";
import { squiggleToGraph } from "./squiggleToGraph";
import { useFileState } from "./useFileState";
import { squiggleNodeType } from "./constants";
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from "reactflow";

// @ts-ignore
if (!cytoscape.__hasInit) {
  cytoscape.use(klay);
  // @ts-ignore
  cytoscape.__hasInit = true;
}

export type GraphState = {
  elements: ElementsDefinition;
  positions: Record<string, { x: number; y: number }>;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
};

export const baseGraphState: GraphState = {
  elements: {
    nodes: [],
    edges: [],
  },
  positions: {},
  nodes: [],
  edges: [],
};

export const useGraphState = create<GraphState>()(
  devtools((set) => baseGraphState, {
    name: "Graph State 2,0",
  })
);

export function completeGraphDataFromSquiggleState(state: SquiggleState) {
  // if there is an error, don't change latest graph state
  if (state.squiggleRunError) return;
  if (!state.squiggleRunResult) {
    // set default state here
    useGraphState.setState(baseGraphState, true, "set default state here");
  } else {
    try {
      // grab squiggle code for later use
      const squiggle = useFileState.getState().project?.squiggle ?? "";

      // Create cyto elements
      const elements = squiggleToGraph(state.squiggleRunResult);

      // get positions
      const positions = getPositions(elements);

      // build react flow nodes
      const nodes = Object.entries(positions).map(([id, { x, y }]) => {
        // find the node in the elements
        const nodeInElements = elements?.nodes.find(
          (node) => node.data.id === id
        );
        if (!nodeInElements) throw new Error("Node not found in elements");
        // get the line before the node in the squiggle
        let comment = squiggle.split("\n")[nodeInElements.data.line - 2] ?? "";

        if (!comment.startsWith("//")) {
          comment = "";
        } else {
          comment = comment.slice(2).trim();
        }
        return {
          id,
          type: squiggleNodeType,
          data: { ...nodeInElements.data, comment, label: id },
          position: { x, y },
        };
      });

      // build react flow edges
      const edges: ReactFlowEdge[] = [];
      for (const edge of elements.edges) {
        const id = edge.data.id;
        if (id)
          edges.push({
            id,
            source: edge.data.source,
            target: edge.data.target,
            style: {
              strokeWidth: 2,
              stroke: "#ccc",
            },
            // markerStart: {
            //   type: MarkerType.Arrow,
            // },
          });
      }

      useGraphState.setState(
        { elements, positions, nodes, edges },
        false,
        "watch squiggle state"
      );
    } catch (e) {
      console.error(e);
    }
  }
}

// This is going to get a set of positions for the elemnts by rendering a temporary cytoscape graph
function getPositions(elements: ElementsDefinition) {
  try {
    // create a div with the class offscreen-canvas
    const div = document.createElement("div");
    div.className = "offscreen-canvas";
    document.body.appendChild(div);
    const cy = cytoscape({
      elements,
      container: div,
      style: [
        {
          selector: "node",
          style: {
            width: "320px",
            height: "200px",
            shape: "rectangle",
            "background-color": "#fff",
            label: "data(id)",
          },
        },
      ],
    });
    cy.layout({
      name: "klay",
      spacingFactor: 1.5,
      klay: {
        direction: "UP",
        nodePlacement: "SIMPLE",
      },
    } as any).run();
    const positions: NonNullable<GraphState["positions"]> = {};
    for (const node of Array.from(cy.nodes())) {
      const id = node.id();
      const { x, y } = node.position();
      positions[id] = { x, y };
    }

    // remove the div
    document.body.removeChild(div);

    return positions;
  } catch (e) {
    console.error(e);
    return {};
  }
}
