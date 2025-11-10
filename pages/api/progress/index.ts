// @/pages/api/progress/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import Progress from "@/models/Progress";
import { verifyAuth } from "@/middleware/verifyAuth";
import { enableCors } from "@/middleware/enableCors";

async function handler(
  req: NextApiRequest & { userId?: string },
  res: NextApiResponse,
) {
  await mongoConnect();

  switch (req.method) {
    case "GET":
      return getProgress(req, res);

    case "PATCH":
      return patchProgress(req, res);

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

export default enableCors(verifyAuth(handler));

const defaultProgressData = [
  {
    nama: "Modul 1",
    bagian: [
      {
        nama: "Bagian 1",
        deskripsi: "Mencari minat dan gairah",
        progress: 0,
        terkunci: false,
      },
      {
        nama: "Bagian 2",
        deskripsi: "Pemetaan berkat & kompetensi",
        progress: 0,
        terkunci: true,
      },
      {
        nama: "Bagian 3",
        deskripsi: "Berkomunikasi",
        progress: 0,
        terkunci: true,
      },
    ],
  },
  {
    nama: "Modul 2",
    bagian: [
      {
        nama: "Bagian 1",
        deskripsi: "Persiapan karir",
        progress: 0,
        terkunci: true,
      },
      {
        nama: "Bagian 2",
        deskripsi: "Personal branding",
        progress: 0,
        terkunci: true,
      },
      {
        nama: "Bagian 3",
        deskripsi: "Belajar bikin Resume",
        progress: 0,
        terkunci: true,
      },
    ],
  },
];

export const config = {
  api: {
    bodyParser: true,
  },
};

async function getProgress(
  req: NextApiRequest & { userId?: string },
  res: NextApiResponse,
) {
  const userId = req.userId as string;
  let progress = await Progress.findOne({ userId });

  // Auto-create progress if not found
  if (!progress) {
    progress = await Progress.create({ userId, moduls: defaultProgressData });
  }

  return res.status(200).json({
    message: "Berhasil mendapatkan progress",
    data: progress,
  });
}

async function patchProgress(
  req: NextApiRequest & { userId?: string },
  res: NextApiResponse,
) {
  const userId = req.userId as string;
  const { modulIndex, bagianIndex, increase } = req.body;

  if (
    modulIndex === undefined ||
    bagianIndex === undefined ||
    typeof increase !== "number"
  ) {
    return res
      .status(400)
      .json({ message: "modulIndex, bagianIndex, dan increase diperlukan" });
  }

  const progressDoc = await Progress.findOne({ userId });
  if (!progressDoc) {
    return res.status(404).json({ message: "Progress tidak ditemukan" });
  }

  const modul = progressDoc.moduls[modulIndex];
  if (!modul) return res.status(400).json({ message: "Modul tidak valid" });

  const bagian = modul.bagian[bagianIndex];
  if (!bagian) return res.status(400).json({ message: "Bagian tidak valid" });

  if (bagian.terkunci) {
    return res.status(403).json({ message: "Bagian masih terkunci" });
  }

  // Tambah progress (A: clamp to max 100)
  bagian.progress = Math.min(100, bagian.progress + increase);

  // Auto unlock next section if reach 100
  if (bagian.progress >= 100) {
    const nextSection = modul.bagian[bagianIndex + 1];
    if (nextSection && nextSection.terkunci) {
      nextSection.terkunci = false;
    }
  }

  await progressDoc.save();

  return res.status(200).json({
    message: "Progress berhasil diperbarui",
    data: progressDoc,
  });
}
