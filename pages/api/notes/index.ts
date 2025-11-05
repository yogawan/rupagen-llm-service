// @/pages/api/notes/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import Note from "@/models/Notes";
import { verifyAuth } from "@/middleware/verifyAuth";
import { enableCors } from "@/middleware/enableCors";

async function handler(
  req: NextApiRequest & { userId?: string; authType?: string },
  res: NextApiResponse,
) {
  await mongoConnect();

  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    switch (req.method) {
      case "POST": {
        const { catatan } = req.body;
        if (!catatan) {
          return res.status(400).json({ message: "Field catatan wajib diisi" });
        }

        // Cek batas harian 3 catatan
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysNotesCount = await Note.countDocuments({
          userId,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        });

        if (todaysNotesCount >= 3) {
          return res.status(429).json({
            message: "Batas maksimum 3 catatan per hari telah tercapai",
          });
        }

        // Create note
        const newNote = await Note.create({ userId, catatan });

        // Tambahkan XP via API /api/stats
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stats`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: req.headers.authorization as string,
            },
            body: JSON.stringify({ xp: 5 }),
          });
        } catch (err) {
          console.error("Gagal update XP:", err);
        }

        return res.status(201).json({
          message: "Catatan berhasil dibuat +5 XP",
          data: newNote,
        });
      }

      case "GET": {
        const notes = await Note.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({
          message: "Berhasil ambil semua catatan",
          data: notes,
        });
      }

      default:
        return res.status(405).json({ message: "Method tidak diizinkan" });
    }
  } catch (error: any) {
    console.error("Notes API Error:", error.message);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
}

export default verifyAuth(enableCors(handler));
