import { create } from "zustand";
import { devtools } from "zustand/middleware";

import debounce from "lodash.debounce";
import { useFileState } from "./useFileState";
import produce from "immer";
import { NodeLocation } from "./schema";

export const useNodeLocation = create<NodeLocation>()(
  devtools((set) => ({}), {
    name: "Node Location",
  })
);

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
