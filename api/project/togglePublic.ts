import { withAuth } from "../lib/_withAuth";
import { prisma } from "db";
import { slugify } from "./_slugify";

const handler = withAuth(async (req, res) => {
  const { id } = req.body;

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const publicName = project.publicName
    ? project.publicName
    : slugify(project.name);

  const updatedProject = await prisma.project.update({
    where: {
      id,
    },
    data: {
      public: !project.public,
      publicName,
    },
  });

  res.status(200).json(updatedProject);
});

export default handler;
