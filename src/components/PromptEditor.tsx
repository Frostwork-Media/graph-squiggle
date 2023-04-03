import produce from "immer";
import { forwardRef, useState } from "react";
import { basePrompt } from "../lib/prompts";
import { useFileState } from "../lib/useFileState";
import { useGlobalSettings } from "../lib/useGlobalSettings";
import { Microphone } from "phosphor-react";

export const PromptEditor = forwardRef<HTMLFormElement, {}>(
  function PromptEditor(_props, ref) {
    const [value, setValue] = useState(basePrompt);
    const apiKey = useGlobalSettings((state) => state.openAIAPIKey);
    const [isLoading, setIsLoading] = useState(false);
    if (!apiKey) return null;
    return (
      <form
        ref={ref}
        className="grid h-full grid grid-rows-[minmax(0,1fr)_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          setIsLoading(true);
          fetch("/api/complete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: value, apiKey }),
          })
            .then((res) => {
              if (res.ok) {
                res.text().then((data) => {
                  useFileState.setState((state) =>
                    produce(state, (draft) => {
                      if (draft.project) {
                        draft.project.squiggle = data;
                      }
                    })
                  );
                });
              }
            })
            .finally(() => setIsLoading(false));
        }}
      >
        <textarea
          className="resize-none bg-transparent h-full leading-6 text-neutral-900 text-sm p-2 focus:outline-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className="bg-blue-700 justify-center text-white p-2 py-4 text-lg flex items-center gap-2 hover:bg-blue-800 active:bg-blue-900">
          <Microphone size={24} />
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
    );
  }
);
