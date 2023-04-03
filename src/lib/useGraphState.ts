import cytoscape, { ElementsDefinition } from "cytoscape";
import { useEffect } from "react";
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { squiggleToGraph } from "./squiggleToGraph";
import { useSquiggleState } from "./useSquiggleState";
import klay from "cytoscape-klay";
import { Node, Edge, MarkerType } from "reactflow";
import { squiggleNodeType } from "./constants";

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

export const useGraphState = create<GraphState>()(
  devtools(
    subscribeWithSelector((set) => ({})),
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
            console.log({ elements });
            useGraphState.setState({ elements }, false, "watch squiggle state");
          } catch (e) {}
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
                  width: "360px",
                  height: "240px",
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
          const nodes = Object.entries(positions).map(([id, { x, y }]) => ({
            id,
            type: squiggleNodeType,
            data: { label: id },
            position: { x, y },
          }));
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
                stroke: "#000",
                strokeWidth: 2,
              },
              markerStart: {
                type: MarkerType.Arrow,
              },
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
