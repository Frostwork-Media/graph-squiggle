import { prisma } from "db";
import { withAuth } from "../lib/_withAuth";

const handler = withAuth(async (req, res, userId) => {
  console.log("userId", userId);
  const response = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  res.json(response);
});

export default handler;
