import { prisma } from "db";
import { withAuth } from "../lib/_withAuth";
import { CONTENT_VERSION } from "../shared";
import { nanoid } from "nanoid";

const handler = withAuth(async (req, res, userId) => {
  const { name, content } = req.body;
  if (!name || !content) {
    res.status(400).json({ message: "Missing name or content" });
    return;
  }

  const id = nanoid(12);

  const project = await prisma.project.create({
    data: {
      id,
      name,
      content,
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
