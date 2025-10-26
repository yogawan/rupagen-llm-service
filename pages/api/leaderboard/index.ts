// @/pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import User from "@/models/User";
import Stats from "@/models/Stats";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await mongoConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Mengambil semua user beserta stats-nya, lalu urutkan berdasarkan xp descending
    const usersWithStats = await Stats.aggregate([
      {
        $lookup: {
          from: "users", // nama collection User di MongoDB (harus lowercase & plural)
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $sort: { xp: -1 } },
      {
        $project: {
          _id: 0,
          streakActive: 1,
          streakCount: 1,
          point: 1,
          xp: 1,
          liga: 1,
          user: {
            nama: 1,
            email: 1,
          },
        },
      },
    ]);

    res.status(200).json({ success: true, data: usersWithStats });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}
