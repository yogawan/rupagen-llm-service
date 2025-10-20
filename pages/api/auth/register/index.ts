import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { mongoConnect } from "@/lib/mongoConnect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await mongoConnect();

  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  const { nama, email, password } = req.body;

  if (!nama || !email || !password)
    return res.status(400).json({ message: "Semua field wajib diisi" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email sudah terdaftar" });

    const newUser = new User({ nama, email, password });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Registrasi berhasil",
      token,
      user: { id: newUser._id, nama: newUser.nama, email: newUser.email },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}
