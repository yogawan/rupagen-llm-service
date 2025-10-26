// @/middleware/verifyAuth.ts
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env.local");
}

interface AuthenticatedRequest extends NextApiRequest {
  userId?: string;
}

export function verifyAuth(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
      return handler(req, res);
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res
        .status(401)
        .json({ message: "Token tidak valid atau sudah kadaluarsa" });
    }
  };
}
