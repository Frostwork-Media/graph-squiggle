import produce from "immer";
import { useState } from "react";
import { basePrompt } from "../lib/prompts";
import { useFileState } from "../lib/useFileState";
import { useGlobalSettings } from "../lib/useGlobalSettings";

export function PromptEditor() {
  const [value, setValue] = useState(basePrompt);
  const apiKey = useGlobalSettings((state) => state.openAIAPIKey);
  const [isLoading, setIsLoading] = useState(false);
  if (!apiKey) return null;
  return (
    <form
      className="grid bg-neutral-100 p-2"
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
        className="resize-none bg-transparent h-64 font-serif"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="bg-neutral-500 text-white p-2 rounded hover:bg-neutral-600 active:bg-neutral-700">
        {isLoading ? "Loading..." : "Generate"}
      </button>
    </form>
  );
}
