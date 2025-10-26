import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import Note from "@/models/Notes";
import { verifyAuth } from "@/middleware/verifyAuth";

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
        const { catatan } = req.body;
        if (!catatan) {
          return res.status(400).json({ message: "Field catatan wajib diisi" });
        }

        const newNote = await Note.create({ userId, catatan });
        return res
          .status(201)
          .json({ message: "Catatan berhasil dibuat", data: newNote });
      }

      case "GET": {
        const notes = await Note.find({ userId }).sort({ createdAt: -1 });
        return res
          .status(200)
          .json({ message: "Berhasil ambil semua catatan", data: notes });
      }

      default:
        return res.status(405).json({ message: "Method tidak diizinkan" });
    }
  } catch (error: any) {
    console.error("Notes API Error:", error.message);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: error.message });
  }
}

export default verifyAuth(handler);
