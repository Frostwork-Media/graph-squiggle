import { prisma } from "../_prisma";
import { withAuth } from "../_withAuth";

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
  });

  res.status(200).json(projects);
});
