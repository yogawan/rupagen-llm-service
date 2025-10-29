// @/pages/api/profile/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import User from "@/models/User";
import { verifyAuth } from "@/middleware/verifyAuth";

async function handler(
  req: NextApiRequest & { userId?: string },
  res: NextApiResponse,
) {
  await mongoConnect();

  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findById(userId).select("-password");

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    res.status(200).json({
      message: "Berhasil ambil user",
      data: user,
    });
  } catch (error: any) {
    console.error("Profile User API Error:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export default verifyAuth(handler);
