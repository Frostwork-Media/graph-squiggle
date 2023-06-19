import { withAuth } from "../lib/_withAuth";
import { prisma } from "db";

const handler = withAuth(async (req, res) => {
  const { id, name } = req.body;

  const project = await prisma.project.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });

  res.status(200).json(project);
});

export default handler;
