import { VercelApiHandler } from "@vercel/node";

import generate from "project-name-generator";
import { prisma } from "db";
import { nanoid } from "nanoid";
import { withAuth } from "../lib/_withAuth";

const CONTENT_VERSION = 1;

const handler: VercelApiHandler = withAuth(async (req, res, userId) => {
  const id = nanoid(12);
  const name = generate().spaced;

  const project = await prisma.project.create({
    data: {
      id,
      name,
      content: "",
      public: false,
      publicName: "",
      userId,
      version: CONTENT_VERSION,
    },
  });

  // return the project id
  res.status(200).json({ id: project.id });
});

export default handler;
