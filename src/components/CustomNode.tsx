import { memo, useMemo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { IconButton } from "../ui/IconButton";
import { Graph } from "phosphor-react";
import { useFileState } from "../lib/useFileState";
import { SquiggleChart } from "@quri/squiggle-components";

export const CustomNode = memo(function CustomNodeBase({ data }: NodeProps) {
  const [showGraph, setShowGraph] = useState(false);
  const code = useFileState((state) => state.project?.squiggle ?? "");
  const squiggleCodeForGraph = useMemo(() => {
    // get line number
    const line = data.line;
    const variableName = data.label;

    // slice the code up to and including the line
    const codeUpToLine = code.split("\n").slice(0, line).join("\n");

    // add variable name as last line
    const codeWithVariable = `${codeUpToLine}\n${variableName}`;

    return codeWithVariable;
  }, [code]);
  return (
    <>
      <Handle type="source" position={Position.Top} />
      <div className="bg-white grid grid-rows-[auto_minmax(0,1fr)] h-full border border-neutral-300 p-1 rounded-xl border-b-8">
        <div className="flex justify-between">
          <div className="overflow-hidden">
            <Chip label={data.label} />
          </div>
          <IconButton
            icon={Graph}
            size={20}
            onClick={() => setShowGraph(!showGraph)}
          />
        </div>
        {showGraph ? (
          <div className="h-[500px]">
            <SquiggleChart
              // @ts-ignore
              height={200}
              code={squiggleCodeForGraph}
            />
          </div>
        ) : (
          <div className="grid content-center justify-center justify-items-center pb-4 px-2 gap-2">
            <span className="text-sm text-center">{data.comment}</span>
            <span className="max-h-36 overflow-auto text-sm text-blue-500 font-mono">
              {data.value}
            </span>
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Bottom} />
    </>
  );
});

export function Chip({ label }: { label: string }) {
  return (
    <div className="bg-blue-50 rounded-lg inline-block p-1 px-2 text-[10px] text-blue-400 max-w-full font-mono overflow-hidden whitespace-nowrap overflow-ellipsis">
      {label}
    </div>
  );
}
