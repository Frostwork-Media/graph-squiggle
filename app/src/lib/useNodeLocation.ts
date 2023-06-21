import { create } from "zustand";
import { devtools } from "zustand/middleware";

import debounce from "lodash.debounce";
import produce from "immer";
import { NodeLocation } from "api";
import { useProject } from "./useProject";

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
    useProject.setState(
      (state) => {
        const nextState = produce(state, (draft) => {
          if (!draft.projectContent) return;
          draft.projectContent.nodeLocation = nodeLocation;
        });

        return nextState;
      },
      true,
      "writeNodeLocation"
    );
  },
  250,
  { leading: false, trailing: true }
);
