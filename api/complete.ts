import { VercelApiHandler } from "@vercel/node";
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";

/**
 * Prompt problems:
 * - hallucinating that it can write javascript, such as console.log and if statements
 * - using wrong scientific notation: radiusEarth = 6.2E+3 to 7.0E+3
 * - using mathematical constants incorrectly: pi instead of Math.pi
 * - not storing the final answer in a variable
 * - multi-line comments
 */
export const systemPrompt = `You are a fermi estimation machine. 
Given a complex questions, you express it as a combination of smaller questions, for which you give a confidence interval.
Your confidence interval is a percentage likelihood you'd be shocked if it was below and a percentage likelihood you'd be shocked if it was above.

// smaller question one
smallerQuestionOne = 0.5 to 0.8

You produce code according to the following rules:
- Each question is stored in a variable (e.g. smallerQuestionOne = 0.5 to 0.8)
- All variable names are camelCase
- Percentages use decimal values (e.g. 0.5 for 50%)
- Do not add units (e.g. 10 to 20, not 10 to 20 years)
- Use a suffix for large or small: 'n' for 10^-9, 'm' for 10^-3, 'k' for 10^3, 'M' for 10^6, and 'B' or 'G' for for 10^9, 'T' for 10^12, and 'P' 10^15 (e.g. 1.2M for 1,200,000)
- Include a one-line comment describing each variable above it
- Combine steps using statistical operators (e.g. +, -, *, /, ^, etc.)
- Do not end lines of code with a semicolon or period
- The final response should be in a variable called "response"
- Do not solve for value, just provide the steps and code
- You only respond with code; no explanation or justification
- If given code, you do not alter the subject of the final response, only the way it is deduced

Example Response:

// one part of estimation
stepNumberOne = 0.5 to 0.8

// another part of estimation
stepNumberTwo = 10k to 50k

// another part of estimation
stepNumberThree = 0.05 to 0.1

// final part of estimation
response = stepNumberOne * stepNumberTwo / stepNumberThree`;

const handler: VercelApiHandler = async (req, res) => {
  // get prompt and api key from request
  const { apiKey, subject, code, prompt } = req.body;

  // throw if either is missing
  if (!subject || !apiKey) {
    res.status(400).send("Missing prompt or api key");
    return;
  }

  // call the function that calls the OpenAI API
  const response = await fromPrompt({ apiKey, subject, code, prompt });
  console.log(response);

  res.status(200).send(response);
};

export default handler;

async function fromPrompt({
  apiKey,
  subject,
  prompt,
  code,
}: {
  apiKey: string;
  subject: string;
  prompt?: string;
  code?: string;
}) {
  const openai = new OpenAIApi(new Configuration({ apiKey }));

  let messages: CreateChatCompletionRequest["messages"] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: subject,
    },
  ];

  // if code and prompt, then add code as first assistant message, followed by user prompt
  if (code && prompt) {
    messages = [
      ...messages,
      {
        role: "assistant",
        content: code,
      },
      {
        role: "user",
        content: prompt,
      },
    ];
  }

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    temperature: 0.5,
    messages,
  });

  return response?.data?.choices?.[0]?.message?.content?.trim();
}
