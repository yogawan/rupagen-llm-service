// @/pages/api/auth/register/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Stats from "@/models/Stats";
import Personality from "@/models/Personality";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  const { nama, email, password } = req.body;

  if (!nama || !email || !password)
    return res.status(400).json({ message: "Semua field wajib diisi" });

  try {
    // 🔹 1. Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email sudah terdaftar" });

    // 🔹 2. Simpan user baru
    const newUser = new User({ nama, email, password });
    await newUser.save();

    // 🔹 3. Buat stats default untuk user baru
    await Stats.create({
      userId: newUser._id,
      streakActive: false,
      streakCount: 0,
      point: 0,
      xp: 0,
      liga: "Perak", // default liga
    });

    // 🔹 4. Buat personality default untuk user baru
    await Personality.create({
      userId: newUser._id,
      kreatifitas: 0,
      keberanian: 0,
      empati: 0,
      kerjaSama: 0,
      tanggungJawab: 0,
      hobiDanMinat: "",
    });

    // 🔹 5. Buat token JWT
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    // 🔹 6. Kirim response
    res.status(201).json({
      message: "Registrasi berhasil",
      token,
      user: {
        id: newUser._id,
        nama: newUser.nama,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export default enableCors(handler);
