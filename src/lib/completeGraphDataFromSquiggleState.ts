import { SquiggleState } from "./useSquiggleState";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import cytoscape, { ElementsDefinition } from "cytoscape";
import klay from "cytoscape-klay";
import { sqProjectToCyElements } from "./sqProjectToCyElements";
import { useFileState } from "./useFileState";
import { squiggleNodeType } from "./constants";
import {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  MarkerType,
} from "reactflow";
import { NODE_WIDTH } from "../components/CustomNode";

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

/**
 * Prepares graph data from squiggle state
 */
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
      const elements = sqProjectToCyElements(
        state.squiggleRunResult,
        state.squiggleCode ?? ""
      );

      // get positions
      const positions = getPositions(elements);

      // build react flow nodes
      const nodes: ReactFlowNode[] = Object.entries(positions).map(
        ([id, { x, y }]) => {
          // find the node in the elements
          const nodeInElements = elements?.nodes.find(
            (node) => node.data.id === id
          );
          if (!nodeInElements) throw new Error("Node not found in elements");

          // get the line before the node in the squiggle
          let commentLine =
            squiggle.split("\n")[nodeInElements.data.line - 2] ?? "";

          let comment = "",
            marketSlug = "";

          if (!commentLine.startsWith("//")) {
            commentLine = "";
          } else {
            commentLine = commentLine.slice(2).trim();
            const parsed = parseComment(commentLine);
            comment = parsed.comment;
            marketSlug = parsed.slug;
          }

          /** if this is a mathematically derived value, don't show the equation  */
          const isDerived = /[*/+-]/gi.test(nodeInElements.data.value);

          /**
           * determine what kind of value this is
           */

          return {
            id,
            type: squiggleNodeType,
            data: {
              ...nodeInElements.data,
              isDerived,
              comment,
              marketSlug,
              label: id,
            },
            draggable: true,
            dragHandle: ".drag-handle",
            position: { x, y },
          };
        }
      );

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
              strokeWidth: 4,
              stroke: "#ccc",
            },
            markerStart: {
              type: MarkerType.Arrow,
              height: 33,
              width: 33,
              strokeWidth: 0.5,
              color: "#ccc",
            },
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

/**
 * This builds a temporary cytoscape instance to get the positions of the nodes
 * */
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
            width: NODE_WIDTH,
            height: "360px",
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

/** Parse comment from label. Extract manifold markets slug if in parentheses at the end of the comment */
export function parseComment(comment: string) {
  if (comment.match(/\(.*\)$/)) {
    const slug = comment.match(/\((.*)\)$/)?.[1] ?? "";
    comment = comment.replace(`(${slug})`, "").trim();
    return { comment, slug };
  }
  return { comment, slug: "" };
}
