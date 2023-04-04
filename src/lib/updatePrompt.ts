import { useFileState } from "./useFileState";

/**
 * Problems so far:
 * -
 */
export const updatePrompt = () => `Our current prediction code:
${useFileState.getState().project?.squiggle ?? ""}

Update our prediction code based on the following prompt and return the updated code only:
`;
