// @/pages/api/personalization/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import Personalization from "@/models/Personalization";
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
      case "POST": {
        const existing = await Personalization.findOne({ userId });
        if (existing) {
          return res.status(400).json({
            message:
              "Personalization sudah dibuat, tidak bisa menambahkan lagi",
          });
        }

        const { waktuBelajar, kekurangan, kelebihan, ceritaSingkat } = req.body;
        if (!waktuBelajar || !ceritaSingkat) {
          return res.status(400).json({
            message: "Field waktuBelajar dan ceritaSingkat wajib diisi",
          });
        }

        const newPersonalization = await Personalization.create({
          userId,
          waktuBelajar,
          kekurangan: kekurangan || [],
          kelebihan: kelebihan || [],
          ceritaSingkat,
        });

        const User = (await import("@/models/User")).default;
        await User.updateOne({ _id: userId }, { personalization: true });

        return res.status(201).json({
          message: "Personalization berhasil dibuat",
          data: newPersonalization,
        });
      }

      case "GET": {
        const data = await Personalization.find({ userId }).sort({
          createdAt: -1,
        });
        return res
          .status(200)
          .json({ message: "Berhasil ambil semua personalization", data });
      }

      default:
        return res.status(405).json({ message: "Method tidak diizinkan" });
    }
  } catch (error: any) {
    console.error("Personalization API Error:", error.message);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: error.message });
  }
}

export default enableCors(verifyAuth(handler));
