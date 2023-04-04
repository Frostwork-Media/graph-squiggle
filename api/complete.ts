import { VercelApiHandler } from "@vercel/node";
import { Configuration, OpenAIApi } from "openai";

/**
 * Prompt problems:
 * - hallucinating that it can write javascript, such as console.log and if statements
 * - using wrong scientific notation: radiusEarth = 6.2E+3 to 7.0E+3
 * - using mathematical constants incorrectly: pi instead of Math.pi
 * - not storing the final answer in a variable
 */
export const systemPrompt = `You are a prediction specialist. You break complex problems into smaller pieces and give a 0.05 and 0.95 confidence interval for each step. Like a Fermi estimation, the 0.05 value is a number you'd be shocked if it was below and the 0.95 a number you'd be shocked if it was above. Then, express the steps in the code according to the following rules:
- For percentages, use decimal values (e.g. 0.5 for 50%)
- For large or small use a suffix: 'n' for 10^-9, 'm' for 10^-3, 'k' for 10^3, 'M' for 10^6, and 'B' or 'G' for for 10^9, 'T' for 10^12, and 'P' 10^15 (e.g. 1.2M for 1,200,000)
- Do not add units to numbers (e.g. 1.2M is correct, 1.2M km is not)
- Include a description in a comment above each line of code
- All variable names should be camelCase
- You may combine steps using statistical operators (e.g. +, -, *, /, ^, etc.)
- Do not end lines of code with a semicolon or period
- Store the final response in a variable called finalAnswer

Example Response:

// one part of estimation
stepNumberOne = 0.5 to 0.8
// another part of estimation
stepNumberTwo = 10k to 50k
// another part of estimation
stepNumberThree = 0.05 to 0.1
// [Original Question]
finalAnswer = stepNumberOne * stepNumberTwo / stepNumberThree


Do not solve for value, just provide the steps and code. You only return commented code, no explanation or justification.`;

const handler: VercelApiHandler = async (req, res) => {
  // get prompt and api key from request
  const { prompt, apiKey } = req.body;

  // throw if either is missing
  if (!prompt || !apiKey) {
    res.status(400).send("Missing prompt or api key");
    return;
  }

  // call the function that calls the OpenAI API
  const response = await fromPrompt({ prompt, apiKey });
  console.log(response);

  res.status(200).send(response);
};

export default handler;

async function fromPrompt({
  prompt,
  apiKey,
}: {
  prompt: string;
  apiKey: string;
}) {
  const openai = new OpenAIApi(new Configuration({ apiKey }));
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: prompt },
    ],
  });
  return response?.data?.choices?.[0]?.message?.content?.trim();
}
