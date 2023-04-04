import { VercelApiHandler } from "@vercel/node";
import { Configuration, OpenAIApi } from "openai";
import { systemPrompt } from "./_prompts";

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
