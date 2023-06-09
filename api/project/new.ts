import { VercelApiHandler } from "@vercel/node";

import generate from "project-name-generator";
import { prisma } from "db";
import { nanoid } from "nanoid";
import { withAuth } from "../lib/_withAuth";
import { CONTENT_VERSION, getEmptyProject } from "../shared";

const handler: VercelApiHandler = withAuth(async (req, res, userId) => {
  const id = nanoid(12);
  const name = generate().spaced;

  const project = await prisma.project.create({
    data: {
      id,
      name,
      content: getEmptyProject(),
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
