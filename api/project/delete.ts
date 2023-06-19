import { withAuth } from "../lib/_withAuth";
import { prisma } from "db";

const handler = withAuth(async (req, res, userId) => {
  // make sure it's a delete request
  if (req.method !== "DELETE") {
    res.status(400).json({ message: "Only DELETE requests allowed" });
    return;
  }

  // get id from body
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ message: "Missing id" });
    return;
  }

  // look for project
  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    select: {
      userId: true,
    },
  });

  // check if project exists
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  // check if user is owner
  if (project.userId !== userId) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  // delete project
  await prisma.project.delete({
    where: {
      id,
    },
  });

  // return success
  res.status(200).json({ success: true });
});

export default handler;
