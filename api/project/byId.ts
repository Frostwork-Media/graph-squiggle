import { prisma } from "db";
import { withAuth } from "../lib/_withAuth";

const handler = withAuth(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ message: "Missing id" });
    return;
  }

  const project = await prisma.project.findUnique({
    where: { id },
  });

  res.status(200).json(project);
});

export default handler;
