import { prisma } from "db";
import { withAuth } from "../lib/_withAuth";

const handler = withAuth(async (req, res, userId) => {
  const { username } = req.body;

  const response = await prisma.user.upsert({
    where: {
      id: userId,
    },
    update: {
      username,
    },
    create: {
      id: userId,
      username,
    },
  });

  res.json(response);
});

export default handler;
