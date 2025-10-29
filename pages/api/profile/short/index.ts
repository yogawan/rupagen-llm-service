// @/pages/api/profile/short/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import User from "@/models/User";
import Stats from "@/models/Stats";
import { verifyAuth } from "@/middleware/verifyAuth";
import { enableCors } from "@/middleware/enableCors";

async function handler(
  req: NextApiRequest & { userId?: string },
  res: NextApiResponse,
) {
  await mongoConnect();

  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findById(userId).select("-password");
    const stats = await Stats.findOne({ userId });

    if (!user || !stats)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    res.status(200).json({
      message: "Berhasil ambil profile",
      data: { user, stats },
    });
  } catch (error: any) {
    console.error("Profile API Error:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export default verifyAuth(enableCors(handler));
