// @/pages/api/auth/register/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Stats from "@/models/Stats";
import Personality from "@/models/Personality";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";
import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadToCloudinary = async (filePath: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "mintrix/users",
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    throw new Error("Failed to upload image to Cloudinary");
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoConnect();

  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const form = formidable({
      maxFiles: 1,
      maxFileSize: 5 * 1024 * 1024,
      filter: ({ mimetype }) => {
        return mimetype && mimetype.includes("image") ? true : false;
      },
    });

    const [fields, files] = await form.parse(req);

    const nama = Array.isArray(fields.nama) ? fields.nama[0] : fields.nama;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const password = Array.isArray(fields.password)
      ? fields.password[0]
      : fields.password;

    if (!nama || !email || !password)
      return res.status(400).json({ message: "Semua field wajib diisi" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email sudah terdaftar" });

    let fotoUrl = null;
    if (files.foto && files.foto[0]) {
      const file = files.foto[0];
      fotoUrl = await uploadToCloudinary(file.filepath);

      fs.unlinkSync(file.filepath);
    }

    const newUser = new User({
      nama,
      email,
      password,
      foto: fotoUrl,
    });
    await newUser.save();

    await Stats.create({
      userId: newUser._id,
      streakActive: false,
      streakCount: 0,
      point: 0,
      xp: 0,
      liga: "Perak",
    });

    await Personality.create({
      userId: newUser._id,
      kreatifitas: 0,
      keberanian: 0,
      empati: 0,
      kerjaSama: 0,
      tanggungJawab: 0,
      hobiDanMinat: "",
    });

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Registrasi berhasil",
      token,
      user: {
        id: newUser._id,
        nama: newUser.nama,
        email: newUser.email,
        foto: newUser.foto,
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export default enableCors(handler);
