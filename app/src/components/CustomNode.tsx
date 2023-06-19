import { ReactNode, useEffect, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useQuery } from "@tanstack/react-query";
import { ManifoldResponse, SquiggleVariableValue } from "../lib/types";
import { SquiggleChart } from "@quri/squiggle-components";
import rangeSlider from "range-slider-input";
import "range-slider-input/dist/style.css";
import {
  throttleSingleUpdate,
  throttleDistributionUpdate,
} from "../lib/updateSquiggleLineSingle";
import { useCodeEdited } from "./SquiggleEditor";
import * as Slider from "@radix-ui/react-slider";
import { numberToPercentage } from "../lib/numberToPercentage";
import { useSquiggleState } from "../lib/useSquiggleState";
import { useProject, useRenderPercentages } from "../lib/useProject";
const manifoldBasePath = "https://manifold.markets/api/v0/slug/";

export const NODE_WIDTH = "400px";

export function CustomNode({ data }: NodeProps) {
  const code = useSquiggleState((state) => state.squiggleCode);
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
      retry: false,
    }
  );

  const valueType = (data.valueType ?? "unknown") as SquiggleVariableValue;

  let squiggleCode = "";
  if (valueType === "derived") {
    squiggleCode = code + "\n\n" + data.label;
  }

  return (
    <>
      <Handle type="target" position={Position.Top} className="top-handle" />
      <div
        className={`bg-white grid grid-rows-[auto_minmax(0,1fr)_auto] h-full border border-neutral-300 p-0 gap-1 rounded-xl border-b-8 cursor-default`}
      >
        <div className="flex gap-1 justify-end p-1">
          <div className="overflow-hidden">
            <Chip label={data.label} />
          </div>
        </div>
        <p className="text-xl px-2 mb-2">{data.comment}</p>
        {valueType === "derived" && (
          <div className="squiggle-chart px-3">
            <DebouceSquiggleChart
              code={squiggleCode}
              enableLocalSettings
              distributionChartSettings={{ minX: 0, maxX: 1 }}
            />
          </div>
        )}
        {valueType === "single" && "numValue" in data && (
          <Single initialValue={data.numValue} line={data.line} />
        )}
        {valueType === "single" && !("numValue" in data) && (
          <span className="text-3xl font-mono text-center pb-2">
            {data.value.toString()}
          </span>
        )}
        {valueType === "distribution" && (
          <Distribution
            lower={data.numLower}
            upper={data.numUpper}
            line={data.line}
          />
        )}
        {market.data && !market.isError && !("error" in market.data) ? (
          <a
            className="bg-purple-50 grid gap-2 text-purple-800 rounded items-start overflow-hidden mt-4"
            href={market.data.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex gap-2 items-center p-3">
              <img
                src="/manifold-market-logo.svg"
                className="w-6 h-6"
                alt="Manifold Markets Logo"
              />
              <span className="text-sm grow">{market.data.question}</span>
            </div>
            <span
              className="text-3xl text-center font-mono p-4 overflow-hidden whitespace-nowrap overflow-ellipsis bg-purple-100"
              title={market.data.probability.toString()}
            >
              {numberToPercentage(market.data.probability)}
            </span>
          </a>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 rounded-full bg-neutral-300 border-none translate-y-[7px]"
      />
    </>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <div className="bg-blue-500 text-neutral-50 rounded-lg inline-block p-1 px-2 text-xs text-blue-400 max-w-full font-mono overflow-hidden whitespace-nowrap overflow-ellipsis">
      {label}
    </div>
  );
}

function getMax(n: number) {
  return n <= 1 ? 1 : Math.pow(10, Math.ceil(Math.log10(n)));
}

function Single({
  initialValue,
  line,
}: {
  initialValue: number;
  line: number;
}) {
  const renderPercentages = useRenderPercentages();
  const lastEdited = useCodeEdited((state) => state.lastEdited);
  const shouldUpdate = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // get a min and max value on the 10's scale of the number
  const [value, setValue] = useState(initialValue);
  // If number is between 0 and 1, return 1
  // If number is between 1 and 10, return 10
  // If number is between 10 and 100, return 100
  // etc.
  const [max, setMax] = useState(getMax(initialValue));

  /**
   * When last edited is triggered then we allow the next initialValue change to reset the state
   */
  useEffect(() => {
    shouldUpdate.current = true;
  }, [lastEdited]);

  /**
   * When the code is edited, we want to update the value of the slider
   */
  useEffect(() => {
    if (!shouldUpdate.current) return;
    setValue(initialValue);
    setMax(getMax(initialValue));
    shouldUpdate.current = false;
    setTimeout(() => {
      if (!inputRef.current) return;
      inputRef.current.value = inputRef.current.defaultValue;
    }, 45);
  }, [initialValue]);

  return (
    <div className="grid gap-2">
      <MedianDisplay>
        {renderPercentages ? numberToPercentage(value) : value}
      </MedianDisplay>
      <Slider.Root
        className="h-6 w-full mt-6 nodrag bg-neutral-200 overflow-hidden relative"
        onValueChange={(value) => {
          setValue(Number(value[0]));
          throttleSingleUpdate(line, value.toString());
        }}
        value={[value]}
        step={max / 100}
        min={0}
        max={max}
        ref={inputRef}
      >
        <Slider.Track>
          <Slider.Range className="h-6 bg-blue-400 absolute left-0" />
          <Slider.Thumb className="w-6 h-6 bg-blue-400 border-none" />
        </Slider.Track>
      </Slider.Root>
    </div>
  );
}

function Distribution({
  lower,
  upper,
  line,
}: {
  lower: number;
  upper: number;
  line: number;
}) {
  const lastEdited = useCodeEdited((state) => state.lastEdited);
  const shouldUpdate = useRef(false);
  const [resetCounter, setResetCounter] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  const init = useRef<[number, number]>([lower, upper]);
  const [value, setValue] = useState([lower, upper]);
  const [max, setMax] = useState(getMax(upper));
  const renderPercentages = useRenderPercentages();

  // Watch lastEdited and allow reset on initialValue after code change
  useEffect(() => {
    shouldUpdate.current = true;
  }, [lastEdited]);

  // Watch initialValue and incrememnt resetCounter to reset the slider
  useEffect(() => {
    if (!shouldUpdate.current) return;
    init.current = [lower, upper];
    setValue([lower, upper]);
    setMax(getMax(upper));
    setResetCounter((c) => c + 1);
    shouldUpdate.current = false;
  }, [lower, upper]);

  useEffect(() => {
    if (!divRef.current) return;
    const slider = rangeSlider(divRef.current, {
      min: 0,
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
  }, [line, max, resetCounter]);

  const from = renderPercentages
    ? numberToPercentage(value[0])
    : value[0].toFixed(2);
  const to = renderPercentages
    ? numberToPercentage(value[1])
    : value[1].toFixed(2);

  return (
    <div className="grid gap-2">
      <MedianDisplay>
        {from} to {to}
      </MedianDisplay>
      <div className="mt-6 nodrag" ref={divRef} />
    </div>
  );
}

function MedianDisplay({ children }: { children: ReactNode }) {
  return (
    <p className="text-3xl text-neutral-600 text-center my-3 font-mono tracking-tighter ordinal slashed-zero tabular-nums">
      {children}
    </p>
  );
}

/** Forward Props to SquiggleChart but debouce them */
function DebouceSquiggleChart(props: Parameters<typeof SquiggleChart>[0]) {
  const debouncedProps = useDebounce(props, 250);
  return <SquiggleChart {...debouncedProps} />;
}

// Hook
function useDebounce(value: any, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}
