// @/pages/api/leaderboard/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { mongoConnect } from "@/lib/mongoConnect";
import { verifyAuth } from "@/middleware/verifyAuth";
import { enableCors } from "@/middleware/enableCors";
import User from "@/models/User";
import Stats from "@/models/Stats";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const usersWithStats = await Stats.aggregate([
      {
        $lookup: {
          from: "users",
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
          xp: 1,
          "user.nama": 1,
          "user.foto": 1,
        },
      },
    ]);

    const formatted = usersWithStats.map((item) => ({
      nama: item.user.nama,
      foto: item.user.foto,
      xp: item.xp,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export default verifyAuth(enableCors(handler));
