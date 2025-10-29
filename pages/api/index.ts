// @/pages/api/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { enableCors } from "@/middleware/enableCors";

type Data = {
  status: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ status: "Application is smoothly running" });
}

export default enableCors(handler);
