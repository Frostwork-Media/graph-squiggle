import { VercelApiHandler } from "@vercel/node";
import { prisma } from "db";
import { getUserId } from "../lib/_withAuth";

const handler: VercelApiHandler = async (req, res) => {
  const { username, publicName } = req.query;
  if (
    !username ||
    !publicName ||
    Array.isArray(username) ||
    Array.isArray(publicName)
  ) {
    res.status(400).json({ error: "Missing username or publicName" });
    return;
  }

  const currentUserId = getUserId(req);

  const user = await prisma.user.findFirst({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const project = await prisma.project.findFirst({
    where: {
      userId: user.id,
      publicName,
      public: true,
    },
    select: {
      id: true,
      userId: true,
      name: true,
      content: true,
      updatedAt: true,
    },
  });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (currentUserId !== project.userId) {
    res.status(200).json({
      name: project.name,
      content: project.content,
      updatedAt: project.updatedAt,
      isOwner: false,
    });
    return;
  }

  // We return the ID if it is the owner viewing the project
  res.status(200).json({
    name: project.name,
    content: project.content,
    updatedAt: project.updatedAt,
    isOwner: true,
    id: project.id,
  });

  return;
};

export default handler;
