import { VercelRequest, VercelResponse } from "@vercel/node";
import { verify } from "jsonwebtoken";

export const getUserId = (req: VercelRequest): string | null => {
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

  // if the session is undefined, return null
  if (!session) {
    return null;
  }

  try {
    // verify the JWT
    const decoded = verify(session, publicKey);

    if (typeof decoded === "string") {
      return null;
    }

    // check exp and nbf
    if (decoded.exp && decoded.nbf) {
      const now = Math.floor(Date.now() / 1000);
      if (now < decoded.nbf || now > decoded.exp) {
        return null;
      }
    }

    const userId = decoded.sub;
    if (!userId) {
      return null;
    }

    return userId;
  } catch (err) {
    console.error(err);

    // if the JWT is invalid, return null
    return null;
  }
};

export const withAuth = (
  handler: (
    req: VercelRequest,
    res: VercelResponse,
    userId: string
  ) => Promise<void>
): ((req: VercelRequest, res: VercelResponse) => Promise<void>) => {
  return async (req, res) => {
    const userId = getUserId(req);

    // if the user is not logged in, return a 401
    if (!userId) {
      res.status(401).send("Unauthorized");
      return;
    }

    // call the handler with the userId
    await handler(req, res, userId);
  };
};
