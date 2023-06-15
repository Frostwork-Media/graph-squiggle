import { prisma } from "db";
import { withAuth } from "../lib/_withAuth";

export default withAuth(async (req, res, userId) => {
  const projects = await prisma.project.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      public: true,
      publicName: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  res.status(200).json(projects);
});
