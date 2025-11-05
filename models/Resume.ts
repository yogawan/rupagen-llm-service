// @/models/Resume.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IResume extends Document {
  userId: Types.ObjectId;
  kontak: {
    namaAwal: string;
    namaAkhir: string;
    jabatanYangDiinginkan: string;
    nomorTelepon: string;
    email: string;
    negara: string;
    kota: string;
    alamatLengkap: string;
  };
  pengalaman: {
    jabatan: string;
    perusahaan: string;
    lokasi: string;
    tanggalMulai: Date;
    tanggalSelesai?: Date;
    deskripsi?: string;
  }[];
  pendidikan: {
    namaSekolah: string;
    lokasi: string;
    penjurusan: string;
    tanggalMulai: Date;
    tanggalSelesai?: Date;
    deskripsi?: string;
  }[];
  keterampilan: {
    namaKeterampilan: string;
    level: number;
  }[];
  bahasa: {
    namaBahasa: string;
    level: number;
  }[];
  sertifikasiDanLisensi: {
    namaSertifikasi: string;
    kredensialSertifikasi?: string;
  }[];
  penghargaanDanApresiasi: {
    namaPenghargaan: string;
    deskripsi?: string;
  }[];
  situsWebDanMediaSosial: {
    namaMediaSosial: string;
    linkMediaSosial: string;
  }[];
  ringkasan?: string;
  resumeLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kontak: {
      namaAwal: { type: String, required: true },
      namaAkhir: { type: String, required: true },
      jabatanYangDiinginkan: { type: String, required: true },
      nomorTelepon: { type: String, required: true },
      email: { type: String, required: true },
      negara: { type: String, required: true },
      kota: { type: String, required: true },
      alamatLengkap: { type: String, required: true },
    },
    pengalaman: [
      {
        jabatan: { type: String, required: true },
        perusahaan: { type: String, required: true },
        lokasi: { type: String, required: true },
        tanggalMulai: { type: Date, required: true },
        tanggalSelesai: { type: Date },
        deskripsi: { type: String },
      },
    ],
    pendidikan: [
      {
        namaSekolah: { type: String, required: true },
        lokasi: { type: String, required: true },
        penjurusan: { type: String, required: true },
        tanggalMulai: { type: Date, required: true },
        tanggalSelesai: { type: Date },
        deskripsi: { type: String },
      },
    ],
    keterampilan: [
      {
        namaKeterampilan: { type: String, required: true },
        level: { type: Number, min: 1, max: 5, required: true },
      },
    ],
    bahasa: [
      {
        namaBahasa: { type: String, required: true },
        level: { type: Number, min: 1, max: 5, required: true },
      },
    ],
    sertifikasiDanLisensi: [
      {
        namaSertifikasi: { type: String, required: true },
        kredensialSertifikasi: { type: String },
      },
    ],
    penghargaanDanApresiasi: [
      {
        namaPenghargaan: { type: String, required: true },
        deskripsi: { type: String },
      },
    ],
    situsWebDanMediaSosial: [
      {
        namaMediaSosial: { type: String, required: true },
        linkMediaSosial: { type: String, required: true },
      },
    ],
    ringkasan: { type: String },
    resumeLink: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.Resume ||
  mongoose.model<IResume>("Resume", ResumeSchema);
