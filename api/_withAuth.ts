import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

export const withAuth = (
  handler: (
    req: VercelRequest,
    res: VercelResponse,
    userId: string
  ) => Promise<void>
): ((req: VercelRequest, res: VercelResponse) => Promise<void>) => {
  return async (req, res) => {
    if (!process.env.JWT_PUBLIC_KEY) {
      throw new Error("JWT_PUBLIC_KEY environment variable is required");
    }

    const splitPem = process.env.JWT_PUBLIC_KEY.match(/.{1,64}/g);
    if (!splitPem) {
      throw new Error("Invalid JWT_PUBLIC_KEY");
    }
    const publicKey =
      "-----BEGIN PUBLIC KEY-----\n" +
      splitPem.join("\n") +
      "\n-----END PUBLIC KEY-----";

    // read the __session cookie
    const session = req.cookies.__session;

    // if the session is undefined, return a 401
    if (!session) {
      res.status(401).send("Unauthorized");
      return;
    }

    try {
      // verify the JWT
      const decoded = jwt.verify(session, publicKey);

      if (typeof decoded === "string") {
        res.status(401).send("Unauthorized");
        return;
      }

      // check exp and nbf
      if (decoded.exp && decoded.nbf) {
        const now = Math.floor(Date.now() / 1000);
        if (now < decoded.nbf || now > decoded.exp) {
          res.status(401).send("Unauthorized");
          return;
        }
      }

      const userId = decoded.sub;
      if (!userId) {
        res.status(401).send("Unauthorized");
        return;
      }

      // call the handler with the userId
      await handler(req, res, userId);
    } catch (err) {
      console.error(err);

      // if the JWT is invalid, return a 401
      res.status(401).send("Unauthorized");
      return;
    }
  };
};
