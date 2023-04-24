import { ReactNode, memo, useEffect, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useQuery } from "@tanstack/react-query";
import { ManifoldResponse, SquiggleVariableValue } from "../lib/types";
import { useFileState } from "../lib/useFileState";
import { SquiggleChart } from "@quri/squiggle-components";
import { DotsSixVertical } from "phosphor-react";
import rangeSlider from "range-slider-input";
import "range-slider-input/dist/style.css";
import {
  throttleSingleUpdate,
  throttleDistributionUpdate,
} from "../lib/updateSquiggleLineSingle";
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

  let squiggleCode = "";
  if (data.isDerived) {
    squiggleCode = code + "\n" + data.label;
  }

  const valueType = (data.valueType ?? "unknown") as SquiggleVariableValue;

  return (
    <>
      <Handle type="target" position={Position.Top} className="top-handle" />
      <div className="bg-white grid grid-rows-[auto_minmax(0,1fr)_auto] h-full border border-neutral-300 p-3 gap-1 rounded-xl border-b-8 cursor-default">
        <div className="flex gap-1 justify-between">
          <div className="drag-handle translate-x-[-5px] translate-y-[-2.5px] opacity-50 hover:opacity-100 cursor-move">
            <DotsSixVertical size={24} />
          </div>
          <div className="overflow-hidden">
            <Chip label={data.label} />
          </div>
        </div>
        <p className="text-lg">{data.comment}</p>
        {valueType === "derived" && (
          <div className="squiggle-chart">
            <SquiggleChart
              code={squiggleCode}
              enableLocalSettings
              distributionChartSettings={{ minX: 0, maxX: 1 }}
            />
          </div>
        )}
        {valueType === "single" && (
          <Single initialValue={data.numValue} line={data.line} />
        )}
        {valueType === "distribution" && (
          <RangeSlider
            initialValue={[data.numLower, data.numUpper]}
            line={data.line}
          />
        )}
        {market.data && (
          <a
            className="bg-purple-50 p-2 flex gap-2 text-purple-800 rounded-lg items-start"
            href={market.data.url}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/manifold-market-logo.svg"
              className="w-6 h-6"
              alt="Manifold Markets Logo"
            />
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
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 rounded-full bg-neutral-300 border-none translate-y-[7px]"
      />
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

function Single({
  initialValue,
  line,
}: {
  initialValue: number;
  line: number;
}) {
  // get a min and max value on the 10's scale of the number
  const [value, setValue] = useState(initialValue);
  const [min] = useState(() => {
    return 0;
  });
  const [max] = useState(() => {
    // If number is between 0 and 1, return 1
    // If number is between 1 and 10, return 10
    // If number is between 10 and 100, return 100
    // etc.
    return Math.pow(10, Math.ceil(Math.log10(value)));
  });

  return (
    <div className="grid gap-2">
      <MedianDisplay>{value}</MedianDisplay>
      <input
        type="range"
        className="w-full mt-6"
        defaultValue={value}
        min={min}
        max={max}
        step={(max - min) / 100}
        onChange={(e) => {
          setValue(Number(e.target.value));
          throttleSingleUpdate(line, e.target.value);
        }}
      />
    </div>
  );
}

function RangeSlider({
  initialValue,
  line,
}: {
  initialValue: [number, number];
  line: number;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const init = useRef<[number, number]>(initialValue);
  const [value, setValue] = useState(initialValue);
  // store a min which is the floor of the given initial value
  const [min] = useState(Math.floor(initialValue[0]));
  // store a max which is the ceiling of the given initial value
  const [max] = useState(Math.ceil(initialValue[1]));

  useEffect(() => {
    if (!divRef.current) return;
    const slider = rangeSlider(divRef.current, {
      min,
      max,
      step: 0.01,
      value: init.current,
      onInput: (v) => {
        setValue(v);
        throttleDistributionUpdate(line, ...v);
      },
    });

    return () => {
      slider.removeGlobalEventListeners();
    };
  }, [line, max, min]);

  return (
    <div className="grid gap-2">
      <MedianDisplay>
        {value[0].toFixed(2)} to {value[1].toFixed(2)}
      </MedianDisplay>
      <div className="mt-6" ref={divRef} />
    </div>
  );
}

function MedianDisplay({ children }: { children: ReactNode }) {
  return (
    <p className="text-4xl text-neutral-600 text-center my-3 font-mono tracking-tighter ordinal slashed-zero tabular-nums">
      {children}
    </p>
  );
}
