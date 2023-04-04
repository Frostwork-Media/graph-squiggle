import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { IconButton } from "../ui/IconButton";
import { Graph } from "phosphor-react";

export const CustomNode = memo(function CustomNodeBase({ data }: NodeProps) {
  return (
    <>
      <Handle type="source" position={Position.Top} />
      <div className="bg-white grid grid-rows-[auto_minmax(0,1fr)] h-full border border-neutral-300 p-1 rounded-xl border-b-8">
        <div className="flex justify-between">
          <div className="overflow-hidden">
            <Chip label={data.label} />
          </div>
          <IconButton icon={Graph} size={20} />
        </div>
        {/* <span>{data.line}</span> */}
        <div className="grid content-center justify-center justify-items-center pb-4 px-2 gap-2">
          <span className="text-sm text-center">{data.comment}</span>
          <span className="max-h-24 overflow-auto text-sm text-blue-500 font-mono">
            {data.value}
          </span>
        </div>
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
