import produce from "immer";
import { forwardRef, useState } from "react";
import { updatePrompt } from "../lib/updatePrompt";
import { useFileState } from "../lib/useFileState";
import { useGlobalSettings } from "../lib/useGlobalSettings";
import { Chats } from "phosphor-react";

export const PromptEditor = forwardRef<HTMLFormElement, {}>(
  function PromptEditor(_props, ref) {
    const [value, setValue] = useState("");
    const apiKey = useGlobalSettings((state) => state.openAIAPIKey);
    const [isLoading, setIsLoading] = useState(false);
    const code = useFileState((state) => state.project?.squiggle ?? "");
    const subject = useFileState((state) => state.project?.subject ?? "");
    if (!apiKey) return null;

    return (
      <form
        ref={ref}
        className="grid h-full grid grid-rows-[minmax(0,1fr)_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!value) return;
          setIsLoading(true);

          let data: {
            apiKey: string;
            subject: string;
            prompt?: string;
            code?: string;
          } = {
            apiKey,
            subject,
          };

          if (!subject) {
            data.subject = value;
            useFileState.setState((state) =>
              produce(state, (draft) => {
                if (draft.project) {
                  draft.project.subject = value;
                }
              })
            );
          } else {
            data.prompt = value;
            data.code = code;
          }

          fetch("/api/complete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
            .then((res) => {
              if (res.ok) {
                res.text().then((data) => {
                  if (isProbablyNotSquiggle(data)) {
                    alert("Error: " + data);
                    return;
                  } else {
                    useFileState.setState((state) =>
                      produce(state, (draft) => {
                        if (draft.project) {
                          draft.project.squiggle = data;
                        }
                      })
                    );
                  }
                });
              }
            })
            .finally(() => setIsLoading(false));
        }}
      >
        <div className="h-full">
          {!subject ? (
            <OpeningQuestion setValue={setValue} />
          ) : (
            <FollowUpQuestion setValue={setValue} />
          )}
        </div>
        <button
          className={`bg-blue-700 justify-center text-white p-2 py-4 text-lg flex items-center gap-2 hover:bg-blue-800 active:bg-blue-900`}
        >
          <Chats size={24} />
          {isLoading ? (
            <span
              className={`w-[100px] text-left ${
                isLoading ? "animate-pulse" : ""
              }`}
            >
              {"Loading"}
              <AnimatedDots />
            </span>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    );
  }
);

/**
 * Determine whether the code represents squiggle code or an error
 *
 * If it does not contain an " = " it's probably not squiggle code
 */
export function isProbablyNotSquiggle(code: string) {
  return !code.includes(" = ");
}

/**
 * An empty space is animated between three ellipses dots to show loading
 */
function AnimatedDots() {
  const [dot, setDot] = useState(0);
  setTimeout(() => setDot((dot + 1) % 4), 250);
  return <>{Array(dot).fill(".").join("")}</>;
}

function OpeningQuestion({ setValue }: { setValue: (value: string) => void }) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="grid gap-3 p-2 h-full grid-rows-[auto_minmax(0,1fr)]">
      <header className="grid gap-1">
        <h2 className="text-lg">What do you want to estimate?</h2>
      </header>
      <textarea
        className="rounded border border-gray-300 p-2 resize-none text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="The number of people in the world in 2030"
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
          setValue(e.target.value);
        }}
      />
    </div>
  );
}

function FollowUpQuestion({ setValue }: { setValue: (value: string) => void }) {
  const [prompt, setPrompt] = useState("");
  return (
    <textarea
      className="resize-none bg-transparent h-full leading-6 text-neutral-900 text-sm p-4 focus:outline-none w-full"
      value={prompt}
      onChange={(e) => {
        setPrompt(e.target.value);
        setValue(e.target.value);
      }}
    />
  );
}
