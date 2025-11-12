// File: /pages/api/titles/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";
import { verifyAuth } from "@/middleware/verifyAuth";
import Title from "@/models/Title";

interface AuthenticatedRequest extends NextApiRequest {
  userId?: string;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await mongoConnect();
  } catch (e) {
    return res.status(500).json({ message: "Gagal konek ke database" });
  }

  switch (req.method) {
    case "GET": {
      try {
        const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
        const limit = Math.max(
          parseInt(String(req.query.limit || "10"), 10),
          1,
        );
        const q = String(req.query.q || "").trim();

        const userObjectId = new mongoose.Types.ObjectId(req.userId);
        const filter: any = { userId: userObjectId };
        if (q) filter.title = { $regex: q, $options: "i" };

        const [items, total] = await Promise.all([
          Title.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
          Title.countDocuments(filter),
        ]);

        return res.status(200).json({
          data: items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        });
      } catch (error: any) {
        console.error("GET /titles error:", error?.message || error);
        return res.status(500).json({ message: "Gagal mengambil data" });
      }
    }

    case "POST": {
      try {
        let { title } = req.body || {};

        // validasi dan fallback default
        if (typeof title !== "string" || !title.trim()) {
          title = "Mulai percakapan dengan dino ...";
        }

        const doc = await Title.create({
          userId: req.userId,
          title: title.trim(),
        });

        return res.status(201).json({ data: doc });
      } catch (error: any) {
        console.error("POST /titles error:", error?.message || error);
        return res.status(500).json({ message: "Gagal membuat data" });
      }
    }

    default: {
      res.setHeader("Allow", "GET, POST, OPTIONS");
      return res.status(405).json({ message: "Method not allowed" });
    }
  }
}

export default enableCors(verifyAuth(handler));
