import { VercelApiHandler } from "@vercel/node";
import { prisma } from "db";

const handler: VercelApiHandler = async (req, res) => {
  const userId = process.env.AI_PAGE_USER_ID;
  if (!userId) {
    res.status(500).json({ error: "User ID not found" });
    return;
  }

  const userName = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      username: true,
    },
  });

  // Find user's projects where the title begins with "ai/"
  const graphs = await prisma.project.findMany({
    where: {
      userId,
      name: {
        startsWith: "ai/",
      },
      public: true,
    },
    select: {
      name: true,
      publicName: true,
    },
  });

  res.status(200).json({ graphs, username: userName?.username || "" });
  return;
};

export default handler;
