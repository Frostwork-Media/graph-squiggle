import produce from "immer";
import { forwardRef, useState } from "react";
import { useGlobalSettings } from "../lib/useGlobalSettings";
import { Chats, X } from "phosphor-react";
import { Textarea } from "../ui/Textarea";
import { useProject } from "../lib/useProject";
import { runSquiggle } from "../lib/runSquiggle";
import { useSquiggleState } from "../lib/useSquiggleState";
import { completeGraphDataFromSquiggleState } from "../lib/completeGraphDataFromSquiggleState";
import { useViewState } from "../lib/useViewState";

export const PromptEditor = forwardRef<HTMLFormElement, {}>(
  function PromptEditor(_props, ref) {
    const [value, setValue] = useState("");
    const apiKey = useGlobalSettings((state) => state.openAIAPIKey);
    const [isLoading, setIsLoading] = useState(false);
    const code = useProject((state) => state.projectContent?.squiggle ?? "");
    const subject = useProject((state) => state.projectContent?.subject ?? "");
    if (!apiKey) return null;

    return (
      <form
        ref={ref}
        className="h-full"
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
                    useProject.setState((state) =>
                      produce(state, (draft) => {
                        if (draft.projectContent) {
                          draft.projectContent.squiggle = data;
                          if (!draft.projectContent.subject) {
                            draft.projectContent.subject = value;
                          }
                        }
                      })
                    );
                    // load it into the project state
                    useProject.setState((state) => {
                      return produce(state, (draft) => {
                        if (!draft.projectContent) return;
                        draft.projectContent.squiggle = data;
                      });
                    });
                    // finally process the changes
                    runSquiggle(data);
                    const squiggleState = useSquiggleState.getState();
                    completeGraphDataFromSquiggleState(squiggleState);
                    // update the current tab
                    useViewState.setState({ tab: "code" });
                  }
                });
              }
            })
            .finally(() => setIsLoading(false));
        }}
      >
        <div className="grid gap-4 p-4 gap-3 content-start">
          {subject && (
            <div className="grid gap-1">
              <button
                className="text-neutral-300 hover:text-neutral-500 active:text-neutral-700 justify-self-end"
                onClick={() => {
                  useProject.setState((state) =>
                    produce(state, (draft) => {
                      if (draft.projectContent) {
                        draft.projectContent.subject = "";
                      }
                    })
                  );
                }}
              >
                <X />
              </button>
              <span className="text-xs text-neutral-500">Subject</span>
              {subject}
            </div>
          )}
          {!subject ? (
            <OpeningQuestion setValue={setValue} />
          ) : (
            <FollowUpQuestion setValue={setValue} />
          )}
          <button
            className={`bg-blue-100 rounded justify-center p-2 py-4 text-lg flex items-center gap-2 hover:bg-blue-200 active:bg-blue-300 text-blue-600`}
          >
            <Chats size={24} />
            {isLoading ? (
              <span className={`w-[100px] text-left`}>
                {"Loading"}
                <AnimatedDots />
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
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
    <div className="grid gap-2 h-full grid-rows-[auto_minmax(0,1fr)]">
      <h2 className="text-lg">What do you want to estimate?</h2>
      <Textarea
        placeholder="The number of people in the world in 2030"
        value={prompt}
        className="min-h-[300px]"
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
    <Textarea
      value={prompt}
      className="min-h-[300px]"
      onChange={(e) => {
        setPrompt(e.target.value);
        setValue(e.target.value);
      }}
    />
  );
}
