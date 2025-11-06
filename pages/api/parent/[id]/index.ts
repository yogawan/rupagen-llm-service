// @/pages/api/parent/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import User from "@/models/User";
import Stats from "@/models/Stats";
import Personality from "@/models/Personality";
import { enableCors } from "@/middleware/enableCors";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "id wajib dikirim" });

  try {
    const user = await User.findById(id).select("-password");
    const stats = await Stats.findOne({ userId: id });
    const personality = await Personality.findOne({ userId: id });

    if (!user || !stats || !personality) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Berhasil ambil profile lengkap",
      data: {
        user,
        stats,
        personality,
      },
    });
  } catch (error: any) {
    console.error("Profile Full API Error:", error.message);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export default enableCors(handler);
