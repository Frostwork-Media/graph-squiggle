import { VercelApiHandler } from "@vercel/node";

const handler: VercelApiHandler = (req, res) => {
  res.status(200).send("Hello World");
};

export default handler;
