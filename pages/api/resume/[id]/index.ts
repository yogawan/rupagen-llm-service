// @/pages/api/resume/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/middleware/verifyAuth";
import { enableCors } from "@/middleware/enableCors";
import { mongoConnect } from "@/lib/mongoConnect";
import Resume from "@/models/Resume";
import mongoose from "mongoose";

async function handler(
  req: NextApiRequest & { userId?: string },
  res: NextApiResponse,
) {
  await mongoConnect();

  const { id } = req.query;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  switch (req.method) {
    case "GET":
      try {
        const resume = await Resume.findOne({ _id: id, userId });
        if (!resume) {
          return res.status(404).json({ message: "Resume tidak ditemukan" });
        }
        return res.status(200).json({
          message: "Berhasil mengambil resume",
          data: resume,
        });
      } catch (error: any) {
        console.error("Error fetching resume:", error);
        return res.status(500).json({
          message: "Gagal mengambil resume",
          error: error.message,
        });
      }

    default:
      return res.status(405).json({ message: "Metode tidak diizinkan" });
  }
}

export default enableCors(verifyAuth(handler));
