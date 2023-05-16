import { Percent, Snowflake } from "phosphor-react";
import { IconButton } from "../ui/IconButton";
import { useNodeLocation } from "../lib/useNodeLocation";
import { useFileState } from "../lib/useFileState";
import { useCallback } from "react";
import produce from "immer";

/**
 * Options for adjusting the graph
 */
export function GraphControls() {
  const renderPercentages = useFileState(state => state.project?.renderPercentages ?? false)
  const isNodeLocationSet = useNodeLocation(
    (state) => !!Object.keys(state).length
  );

  const toggleRenderPercentages = useCallback(() => {
    useFileState.setState(state => {
      return produce(state, draft => {
        if (!draft.project) return;
        draft.project.renderPercentages = !draft.project.renderPercentages
      });
    }, false, "toggleRenderPercentages")
  }, [])

  return (
    <div
      className={`absolute p-1 top-2 right-1/2 translate-x-1/2 text-[0px] z-10 bg-white border border-neutral-200 rounded-lg shadow-md`}
    >
      <IconButton
        icon={Snowflake}
        className={`${
          isNodeLocationSet
            ? "bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
            : "hover:bg-transparent"
        }`}
        onClick={() => {
          useNodeLocation.setState({}, true);
        }}
      />
      <IconButton
        icon={Percent}
        className={`${
          renderPercentages
            ? "bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
            : ""
        }`}
        onClick={toggleRenderPercentages}
        />
    </div>
  );
}
