// @/middleware/verifyAuthHybrid.ts
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { verifyToken } from "@clerk/backend"; // gunakan Clerk SDK backend resmi

const JWT_SECRET = process.env.JWT_SECRET as string;
const CLERK_JWT_ISSUER = "https://current-panda-81.clerk.accounts.dev"; // ganti sesuai instance Clerk lu

interface AuthenticatedRequest extends NextApiRequest {
  userId?: string;
  authType?: "clerk" | "jwt";
}

export function verifyAuthHybrid(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];

    try {
      // 🔹 Langkah 1 — coba verify pakai Clerk
      const clerkRes = await verifyToken(token, {
        issuer: CLERK_JWT_ISSUER,
      }).catch(() => null);

      if (clerkRes?.sub) {
        req.userId = clerkRes.sub;
        req.authType = "clerk";
        return handler(req, res);
      }

      // 🔹 Langkah 2 — kalau gagal, verify pakai JWT biasa
      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"],
      }) as { userId: string };
      req.userId = decoded.userId;
      req.authType = "jwt";

      return handler(req, res);
    } catch (error: any) {
      console.error("Hybrid Auth Error:", error.message);
      return res
        .status(401)
        .json({
          message: "Token tidak valid atau sudah kadaluarsa",
          error: error.message,
        });
    }
  };
}
