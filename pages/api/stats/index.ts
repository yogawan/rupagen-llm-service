import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/middleware/verifyAuth";
import { enableCors } from "@/middleware/enableCors";
import { mongoConnect } from "@/lib/mongoConnect";
import Stats from "@/models/Stats";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await mongoConnect();
  const { userId } = req as any;

  switch (req.method) {
    case "GET":
      try {
        const stats = await Stats.findOne({ userId });

        if (!stats) {
          return res
            .status(404)
            .json({ message: "Data stats tidak ditemukan" });
        }

        return res.status(200).json({
          message: "Berhasil mengambil data stats",
          stats,
        });
      } catch (error: any) {
        console.error("Get Stats Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
      }

    case "PATCH":
      try {
        const allowedFields = [
          "streakActive",
          "streakCount",
          "point",
          "xp",
          "liga",
        ];
        const updateData: Record<string, any> = {};

        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
          }
        }

        if (updateData.liga) {
          const validLiga = ["Perak", "Silver", "Emas"];
          if (!validLiga.includes(updateData.liga)) {
            return res.status(400).json({ message: "Liga tidak valid" });
          }
        }

        if (Object.keys(updateData).length === 0) {
          return res
            .status(400)
            .json({ message: "Tidak ada field yang dikirim" });
        }

        const updatedStats = await Stats.findOneAndUpdate(
          { userId },
          { $set: updateData },
          { new: true, runValidators: true },
        );

        if (!updatedStats)
          return res
            .status(404)
            .json({ message: "Data stats tidak ditemukan" });

        return res.status(200).json({
          message: "Stats berhasil diperbarui",
          stats: updatedStats,
        });
      } catch (error: any) {
        console.error("Update Stats Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
      }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default verifyAuth(enableCors(handler));
