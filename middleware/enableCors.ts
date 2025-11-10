// @/middleware/enableCors.ts
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

const cors = Cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export function enableCors(handler: (req: NextApiRequest, res: NextApiResponse) => any) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    // jalankan CORS
    await runMiddleware(req, res, cors);

    // lanjut ke handler asli
    return handler(req, res);
  };
}
