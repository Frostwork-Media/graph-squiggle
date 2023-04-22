import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useQuery } from "@tanstack/react-query";
import { ManifoldResponse } from "../lib/types";
import { useFileState } from "../lib/useFileState";
import { SquiggleChart } from "@quri/squiggle-components";

const manifoldBasePath = "https://manifold.markets/api/v0/slug/";

export const NODE_WIDTH = "400px";

export const CustomNode = memo(function CustomNodeBase({ data }: NodeProps) {
  const code = useFileState((state) => state.project?.squiggle ?? "");
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

  // if this is a mathematically derived value, don't show the equation
  const isDerived = /[\*\/\+\-]/gi.test(data.value);

  let squiggleCode = "";
  if (isDerived) {
    squiggleCode = code + "\n" + data.label;
  }

  return (
    <>
      <Handle type="source" position={Position.Top} />
      <div className="bg-white grid grid-rows-[auto_minmax(0,1fr)_auto] h-full border border-neutral-300 p-3 gap-1 rounded-xl border-b-8">
        <div className="grid gap-1">
          <div className="overflow-hidden">
            <Chip label={data.label} />
          </div>
        </div>
        <p className="text-lg">{data.comment}</p>
        {isDerived ? (
          <div>
            <SquiggleChart code={squiggleCode} enableLocalSettings />
          </div>
        ) : (
          <p className="text-4xl text-neutral-600 text-center my-3 font-mono">
            {data.value}
          </p>
        )}
        {market.data && (
          <a
            className="bg-purple-50 p-2 flex gap-2 text-purple-800 rounded-lg items-start"
            href={market.data.url}
            target="_blank"
            rel="noreferrer"
          >
            <img src="/manifold-market-logo.svg" className="w-6 h-6" />
            <span className="text-sm grow">{market.data.question}</span>
            <span
              className="text-xs font-mono max-w-[60px] overflow-hidden whitespace-nowrap overflow-ellipsis rounded-full bg-purple-200 px-1"
              title={market.data.probability.toString()}
            >
              {market.data.probability}
            </span>
          </a>
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
