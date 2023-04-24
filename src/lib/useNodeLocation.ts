import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Node as ReactFlowNode } from "reactflow";
import { NodeLocation } from "./schema";

import debounce from "lodash.debounce";
import { useFileState } from "./useFileState";
import produce from "immer";

export const useNodeLocation = create<NodeLocation>()(
  devtools((set) => ({}), {
    name: "Node Location",
  })
);

/**
 * Receives the nodes before they are passed to react flow
 * and replaces the x and y coordinates with the ones
 * stored in the node location store if they exist
 */
export function preferCustomNodeLocation(
  nodes: ReactFlowNode[],
  nodeLocation: NodeLocation
) {
  return nodes.map((node) => {
    if (nodeLocation[node.id]) {
      return {
        ...node,
        position: {
          x: nodeLocation[node.id].x,
          y: nodeLocation[node.id].y,
        },
      };
    }
    return node;
  });
}

/**
 * Write the node location to the store
 * back to the project in a debounced way
 * @param nodeLocation
 */
export const writeNodeLocation = debounce(
  (nodeLocation: NodeLocation) => {
    useFileState.setState((state) => {
      const nextState = produce(state, (draft) => {
        if (!draft.project) return;
        draft.project.nodeLocation = nodeLocation;
      });

      return nextState;
    });
  },
  250,
  { leading: false, trailing: true }
);
