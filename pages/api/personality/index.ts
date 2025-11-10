// @/pages/api/personality/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import Personality from "@/models/Personality";
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
    switch (req.method) {
      case "GET": {
        const personality = await Personality.findOne({ userId });
        if (!personality)
          return res
            .status(404)
            .json({ message: "Data personality tidak ditemukan" });

        return res.status(200).json({
          message: "Berhasil ambil data personality",
          data: personality,
        });
      }

      case "PATCH": {
        const {
          kreatifitas,
          keberanian,
          empati,
          kerjaSama,
          tanggungJawab,
          hobiDanMinat,
        } = req.body;

        const personality = await Personality.findOne({ userId });
        if (!personality)
          return res
            .status(404)
            .json({ message: "Data personality tidak ditemukan" });

        if (kreatifitas !== undefined) personality.kreatifitas = kreatifitas;
        if (keberanian !== undefined) personality.keberanian = keberanian;
        if (empati !== undefined) personality.empati = empati;
        if (kerjaSama !== undefined) personality.kerjaSama = kerjaSama;
        if (tanggungJawab !== undefined)
          personality.tanggungJawab = tanggungJawab;
        if (hobiDanMinat !== undefined) personality.hobiDanMinat = hobiDanMinat;

        await personality.save();

        return res.status(200).json({
          message: "Personality berhasil diperbarui",
          data: personality,
        });
      }

      default:
        return res.status(405).json({ message: "Method tidak diizinkan" });
    }
  } catch (error: any) {
    console.error("Personality API Error:", error.message);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: error.message });
  }
}

export default enableCors(verifyAuth(handler));
