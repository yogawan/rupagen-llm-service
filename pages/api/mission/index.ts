// @/pages/api/mission/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import Mission from "@/models/Mission";
import { verifyAuth } from "@/middleware/verifyAuth";
import { enableCors } from "@/middleware/enableCors";

async function handler(
  req: NextApiRequest & { userId?: string },
  res: NextApiResponse,
) {
  await mongoConnect();

  const userId = req.userId;

  if (req.method === "POST") {
    let mission = await Mission.findOne({ userId });

    if (mission) {
      return res.status(200).json({
        message: "Mission sudah ada untuk user ini",
        data: mission,
      });
    }

    mission = await Mission.create({ userId });

    return res.status(201).json({
      message: "Mission berhasil dibuat",
      data: mission,
    });
  }

  if (req.method === "GET") {
    let mission = await Mission.findOne({ userId });

    if (!mission) {
      mission = await Mission.create({ userId });
    }

    return res.status(200).json({
      message: "Berhasil ambil mission user",
      data: mission,
    });
  }

  if (req.method === "PATCH") {
    const allowedFields = [
      "ajakNgobrolDino",
      "lakukanHobimuHariIni",
      "hubungkanAkunmuDenganOrangTua",
    ];

    const updateData: Partial<Record<string, boolean>> = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const mission = await Mission.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true },
    );

    return res.status(200).json({
      message: "Mission berhasil diupdate",
      data: mission,
    });
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default verifyAuth(enableCors(handler));
