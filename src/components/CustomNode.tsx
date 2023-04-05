import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useQuery } from "@tanstack/react-query";
import { ManifoldResponse } from "../lib/types";

const manifoldBasePath = "https://manifold.markets/api/v0/slug/";

export const CustomNode = memo(function CustomNodeBase({ data }: NodeProps) {
  const market = useQuery(
    ["market", data.marketSlug],
    async () => {
      const response = await fetch(`${manifoldBasePath}${data.marketSlug}`);
      return response.json() as Promise<ManifoldResponse>;
    },
    {
      enabled: !!data.marketSlug,
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
  return (
    <>
      <Handle type="source" position={Position.Top} />
      <div className="bg-white grid grid-rows-[auto_minmax(0,1fr)_auto] h-full border border-neutral-300 p-1 rounded-xl border-b-8">
        <div className="grid gap-1">
          <div className="overflow-hidden">
            <Chip label={data.label} />
          </div>
        </div>
        <div className="grid content-center justify-center justify-items-center pb-4 px-2 gap-2">
          <span className="text-center text-lg">{data.comment}</span>
          <span className="max-h-36 overflow-auto text-sm text-blue-500 font-mono text-center">
            {data.value}
          </span>
        </div>
        {market.data && (
          <div className="bg-purple-50 p-2 flex gap-2 text-purple-800 rounded-lg items-start">
            <img src="/manifold-market-logo.svg" className="w-4 h-4" />
            <span className="text-sm grow">{market.data.question}</span>
            <span
              className="text-xs font-mono max-w-[60px] overflow-hidden whitespace-nowrap overflow-ellipsis rounded-full bg-purple-200 px-1"
              title={market.data.probability.toString()}
            >
              {market.data.probability}
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
