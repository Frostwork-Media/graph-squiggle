import cytoscape, { ElementsDefinition } from "cytoscape";
import { useEffect } from "react";
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { squiggleToGraph } from "./squiggleToGraph";
import { useSquiggleState } from "./useSquiggleState";
import klay from "cytoscape-klay";
import { Node, Edge, MarkerType } from "reactflow";
import { squiggleNodeType } from "./constants";
import { useFileState } from "./useFileState";

// @ts-ignore
if (!cytoscape.__hasInit) {
  cytoscape.use(klay);
  // @ts-ignore
  cytoscape.__hasInit = true;
}

type GraphState = {
  /**
   * Cytoscape elements
   */
  elements?: ElementsDefinition;
  /** Element positions  */
  positions?: Record<string, { x: number; y: number }>;
  /** React Flow Nodes */
  nodes?: Node[];
  /** React Flow Edges */
  edges?: Edge[];
};

export const baseGraphState: GraphState = {};
export const useGraphState = create<GraphState>()(
  devtools(
    subscribeWithSelector((set) => baseGraphState),
    {
      name: "Graph State",
    }
  )
);

export function useWatchSquiggle() {
  useEffect(() => {
    /** Subscribe to parsed squiggle project state and generate graph */
    const unsub1 = useSquiggleState.subscribe(
      (state) => state.squiggleRunResult,
      (project) => {
        if (project) {
          try {
            const elements = squiggleToGraph(project);
            useGraphState.setState({ elements }, false, "watch squiggle state");
          } catch (e) {
            console.error(e);
          }
        } else {
          useGraphState.setState(
            { elements: undefined },
            false,
            "watch squiggle state"
          );
        }
      },
      {
        fireImmediately: false,
      }
    );

    /* Subscribe to elements and update positions by rendering a headless cytoscape instance */
    const unsub2 = useGraphState.subscribe(
      (state) => state.elements,
      (
        elements = {
          nodes: [],
          edges: [],
        }
      ) => {
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
          useGraphState.setState(
            { positions },
            false,
            "watch elements, set positions"
          );

          // remove the div
          document.body.removeChild(div);
        } catch (e) {
          console.error(e);
        }
      },
      {
        fireImmediately: false,
      }
    );

    // Watch positions and build reactflow nodes
    const unsub3 = useGraphState.subscribe(
      (state) => state.positions,
      (positions) => {
        if (positions) {
          const elements = useGraphState.getState().elements;
          const squiggle = useFileState.getState().project?.squiggle;
          if (!elements || !squiggle) return;
          const nodes = Object.entries(positions).map(([id, { x, y }]) => {
            // find the node in the elements
            const nodeInElements = elements?.nodes.find(
              (node) => node.data.id === id
            );
            if (!nodeInElements) throw new Error("Node not found in elements");
            // get the line before the node in the squiggle
            let comment = squiggle.split("\n")[nodeInElements.data.line - 2];
            console.log(squiggle.split("\n"));

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
          useGraphState.setState(
            { nodes },
            false,
            "watch positions, set nodes"
          );
        }
      },
      {
        fireImmediately: false,
      }
    );

    const unsub4 = useGraphState.subscribe(
      (state) => state.elements,
      (
        elements = {
          nodes: [],
          edges: [],
        }
      ) => {
        const edges: Edge[] = [];
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
          {
            edges,
          },
          false,
          "watch elements, set edges"
        );
      },
      {
        fireImmediately: false,
      }
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);
}
