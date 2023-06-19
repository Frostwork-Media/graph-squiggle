import { slugify } from "shared";
import { withAuth } from "../lib/_withAuth";
import { prisma } from "db";

const handler = withAuth(async (req, res) => {
  const { id, publicName } = req.body;

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    res.status(404).json({
      error: "Project not found",
    });
    return;
  }

  const response = await prisma.project.update({
    where: {
      id,
    },
    data: {
      publicName: slugify(publicName),
    },
  });

  res.status(200).json(response);
  return;
});

export default handler;
