import { useFileState } from "./useFileState";

/**
 * Problems so far:
 * -
 */
export const updatePrompt = () => `Our current prediction code:
${useFileState.getState().project?.squiggle ?? ""}

Update our prediction code based on the following prompt.
Do not replace the existing code, but add to it or modify it.
Return only code, no explanation.

Prompt:
`;
