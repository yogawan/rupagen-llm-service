// @/pages/api/personalization/[id]/index.ts
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

  const { id } = req.query;
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const personalization = await Personalization.findOne({ _id: id, userId });
    if (!personalization)
      return res.status(404).json({
        message: "Personalization tidak ditemukan atau tidak punya akses",
      });

    switch (req.method) {
      case "GET":
        return res.status(200).json({
          message: "Berhasil ambil personalization",
          data: personalization,
        });

      case "PUT": {
        const { waktuBelajar, kekurangan, kelebihan, ceritaSingkat } = req.body;

        if (!waktuBelajar || !ceritaSingkat) {
          return res.status(400).json({
            message: "Field waktuBelajar dan ceritaSingkat wajib diisi",
          });
        }

        personalization.waktuBelajar = waktuBelajar;
        personalization.kekurangan = kekurangan || [];
        personalization.kelebihan = kelebihan || [];
        personalization.ceritaSingkat = ceritaSingkat;

        await personalization.save();

        const User = (await import("@/models/User")).default;
        await User.updateOne({ _id: userId }, { personalization: true });

        return res.status(200).json({
          message: "Personalization berhasil diperbarui",
          data: personalization,
        });
      }

      case "DELETE": {
        await Personalization.deleteOne({ _id: id, userId });
        return res
          .status(200)
          .json({ message: "Personalization berhasil dihapus" });
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

export default verifyAuth(enableCors(handler));
