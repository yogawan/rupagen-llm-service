// @/pages/api/notes/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import Note from "@/models/Notes";
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
    const note = await Note.findOne({ _id: id, userId });
    if (!note)
      return res
        .status(404)
        .json({ message: "Catatan tidak ditemukan atau tidak punya akses" });

    switch (req.method) {
      case "GET":
        return res
          .status(200)
          .json({ message: "Berhasil ambil catatan", data: note });

      case "PUT": {
        const { catatan: newCatatan } = req.body;
        if (!newCatatan)
          return res.status(400).json({ message: "Field catatan wajib diisi" });

        note.catatan = newCatatan;
        await note.save();

        return res
          .status(200)
          .json({ message: "Catatan berhasil diperbarui", data: note });
      }

      case "DELETE": {
        await Note.deleteOne({ _id: id, userId });
        return res.status(200).json({ message: "Catatan berhasil dihapus" });
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

export default verifyAuth(enableCors(handler));
