import { Snowflake } from "phosphor-react";
import { IconButton } from "../ui/IconButton";
import { useNodeLocation } from "../lib/useNodeLocation";

/**
 * Options for adjusting the graph
 */
export function GraphControls() {
  const isNodeLocationSet = useNodeLocation(
    (state) => !!Object.keys(state).length
  );
  return (
    <div
      className={`absolute p-1 top-2 right-1/2 translate-x-1/2 text-[0px] z-10 bg-white border border-neutral-200 rounded-lg shadow-md`}
    >
      <IconButton
        icon={Snowflake}
        className={`${
          isNodeLocationSet
            ? "bg-neutral-600 text-white hover:bg-neutral-700"
            : ""
        }`}
        onClick={() => {
          useNodeLocation.setState({}, true);
        }}
      />
    </div>
  );
}
