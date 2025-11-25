// @/pages/api/dino/llm/history/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";
import { verifyAuth } from "@/middleware/verifyAuth";
import Title from "@/models/Title";
import History from "@/models/History";

interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AuthenticatedRequest extends NextApiRequest {
  userId?: string;
}

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function callDinoLLM(systemContent: string, userContent: string) {
  const apiUrl =
    "https://core-rupagen-llm-service.vercel.app/api/llm/dino/chat";

  const body = {
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ],
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Dino API Error: ${response.status}`);
  }

  const result = await response.json();
  // Pastikan Dino API punya field `content` hasil balasan
  const assistantMessage =
    result?.assistant ?? result?.message ?? JSON.stringify(result);
  return assistantMessage;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await mongoConnect();
  } catch {
    return res.status(500).json({ message: "Gagal konek ke database" });
  }

  const { id } = req.query;
  const titleId = Array.isArray(id) ? id[0] : id;

  if (!titleId || !isValidObjectId(titleId)) {
    return res.status(400).json({ message: "Param id tidak valid" });
  }

  const title = await Title.findOne({
    _id: titleId,
    userId: req.userId,
  }).lean();
  if (!title) {
    return res
      .status(404)
      .json({ message: "Title tidak ditemukan atau bukan milikmu" });
  }

  switch (req.method) {
    case "GET": {
      const doc = await History.findOne({ titleId });
      return res.status(200).json({
        message: "Berhasil mengambil data",
        data: doc ? doc.toObject({ versionKey: false }) : null,
      });
    }

    case "POST": {
      try {
        const { content } = req.body || {};
        if (typeof content !== "string" || !content.trim()) {
          return res
            .status(400)
            .json({ message: "Field 'content' wajib diisi" });
        }

        // Ambil ringkasan profil dari API pertama
        const profileRes = await fetch(
          "https://mintrix.yogawanadityapratama.com/api/summarize",
          {
            headers: {
              Authorization: req.headers.authorization || "",
              "Content-Type": "application/json",
            },
          },
        );
        const profileData = await profileRes.json();
        const systemContent = profileData.summary || "";

        // Panggil API Dino untuk dapatkan response AI
        const assistantReply = await callDinoLLM(systemContent, content);

        // Buat pesan user & assistant
        const newMessages: IMessage[] = [
          { role: "user", content: content.trim() },
          { role: "assistant", content: assistantReply },
        ];

        // Simpan ke database (upsert by titleId)
        const updated = await History.findOneAndUpdate(
          { titleId },
          {
            $setOnInsert: { titleId },
            $push: { messages: { $each: newMessages } },
          },
          { upsert: true, new: true },
        );

        return res.status(201).json({
          message: "Pesan dan respons berhasil disimpan",
          data: updated.toObject({ versionKey: false }),
        });
      } catch (error: any) {
        console.error("POST /history error:", error);
        return res.status(500).json({
          message: "Gagal memproses chat atau menyimpan riwayat",
          error: error.message,
        });
      }
    }

    default:
      res.setHeader("Allow", "GET, POST, OPTIONS");
      return res.status(405).json({ message: "Method tidak diizinkan" });
  }
}

export default enableCors(verifyAuth(handler));
