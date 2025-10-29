// @/pages/api/resume/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/middleware/verifyAuth";
import { enableCors } from "@/middleware/enableCors";
import { mongoConnect } from "@/lib/mongoConnect";
import Resume from "@/models/Resume";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function generateResumePDF(resumeData: any) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const black = rgb(0, 0, 0);
  const white = rgb(1, 1, 1);
  const darkGray = rgb(0.3, 0.3, 0.3);
  const lightBorder = rgb(0.85, 0.85, 0.85);

  const margin = 50;
  let y = height - margin;
  let currentPage = page;

  const checkNewPage = (spaceNeeded: number) => {
    if (y < margin + spaceNeeded) {
      page = pdfDoc.addPage([595.28, 841.89]);
      currentPage = page;
      y = height - margin;
      return true;
    }
    return false;
  };

  const kontak = resumeData.kontak;

  const fullName = `${kontak.namaAwal} ${kontak.namaAkhir}`.toUpperCase();
  page.drawText(fullName, {
    x: margin,
    y: y,
    size: 18,
    font: boldFont,
    color: black,
  });
  y -= 25;

  page.drawText(kontak.jabatanYangDiinginkan, {
    x: margin,
    y: y,
    size: 12,
    font: regularFont,
    color: black,
  });
  y -= 30;

  page.drawText("KONTAK", {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
    color: black,
  });
  
  page.drawLine({
    start: { x: margin, y: y - 5 },
    end: { x: width - margin, y: y - 5 },
    thickness: 1,
    color: lightBorder,
  });
  
  y -= 20;

  page.drawText(`Email: ${kontak.email}`, {
    x: margin,
    y: y,
    size: 10,
    font: regularFont,
    color: black,
  });
  y -= 15;

  page.drawText(`Telepon: ${kontak.nomorTelepon}`, {
    x: margin,
    y: y,
    size: 10,
    font: regularFont,
    color: black,
  });
  y -= 15;

  page.drawText(`Alamat: ${kontak.kota}, ${kontak.negara}`, {
    x: margin,
    y: y,
    size: 10,
    font: regularFont,
    color: black,
  });
  y -= 30;

  if (resumeData.ringkasan) {
    page.drawText("RINGKASAN PROFESIONAL", {
      x: margin,
      y: y,
      size: 12,
      font: boldFont,
      color: black,
    });
    
    page.drawLine({
      start: { x: margin, y: y - 5 },
      end: { x: width - margin, y: y - 5 },
      thickness: 1,
      color: lightBorder,
    });
    
    y -= 20;

    const words = resumeData.ringkasan.split(" ");
    let line = "";
    const maxWidth = width - margin * 2;

    words.forEach((word: string, idx: number) => {
      const testLine = line + (line ? " " : "") + word;
      const textWidth = regularFont.widthOfTextAtSize(testLine, 10);

      if (textWidth > maxWidth && line) {
        page.drawText(line, {
          x: margin,
          y: y,
          size: 10,
          font: regularFont,
          color: black,
        });
        y -= 15;
        line = word;
      } else {
        line = testLine;
      }

      if (idx === words.length - 1 && line) {
        page.drawText(line, {
          x: margin,
          y: y,
          size: 10,
          font: regularFont,
          color: black,
        });
        y -= 15;
      }
    });
    y -= 20;
  }

  if (resumeData.pengalaman && resumeData.pengalaman.length > 0) {
    checkNewPage(100);

    page.drawText("PENGALAMAN KERJA", {
      x: margin,
      y: y,
      size: 12,
      font: boldFont,
      color: black,
    });
    
    page.drawLine({
      start: { x: margin, y: y - 5 },
      end: { x: width - margin, y: y - 5 },
      thickness: 1,
      color: lightBorder,
    });
    
    y -= 25;

    resumeData.pengalaman.forEach((exp: any) => {
      checkNewPage(80);

      page.drawCircle({
        x: margin + 5,
        y: y - 5,
        size: 2,
        color: black,
      });

      page.drawText(exp.jabatan, {
        x: margin + 15,
        y: y,
        size: 11,
        font: boldFont,
        color: black,
      });
      y -= 18;

      page.drawText(exp.perusahaan, {
        x: margin + 15,
        y: y,
        size: 10,
        font: regularFont,
        color: black,
      });
      y -= 15;

      const startDate = new Date(exp.tanggalMulai).toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });
      const endDate = exp.tanggalSelesai
        ? new Date(exp.tanggalSelesai).toLocaleDateString("id-ID", {
            month: "short",
            year: "numeric",
          })
        : "Sekarang";

      page.drawText(`${startDate} - ${endDate} | ${exp.lokasi}`, {
        x: margin + 15,
        y: y,
        size: 10,
        font: regularFont,
        color: darkGray,
      });
      y -= 18;

      if (exp.deskripsi) {
        const descWords = exp.deskripsi.split(" ");
        let descLine = "";
        const maxWidth = width - margin * 2 - 15;

        descWords.forEach((word: string, idx: number) => {
          const testLine = descLine + (descLine ? " " : "") + word;
          const textWidth = regularFont.widthOfTextAtSize(testLine, 10);

          if (textWidth > maxWidth && descLine) {
            page.drawText(descLine, {
              x: margin + 15,
              y: y,
              size: 10,
              font: regularFont,
              color: black,
            });
            y -= 15;
            descLine = word;
          } else {
            descLine = testLine;
          }

          if (idx === descWords.length - 1 && descLine) {
            page.drawText(descLine, {
              x: margin + 15,
              y: y,
              size: 10,
              font: regularFont,
              color: black,
            });
            y -= 15;
          }
        });
      }
      y -= 20;
    });
    y -= 10;
  }

  if (resumeData.pendidikan && resumeData.pendidikan.length > 0) {
    checkNewPage(100);

    page.drawText("PENDIDIKAN", {
      x: margin,
      y: y,
      size: 12,
      font: boldFont,
      color: black,
    });
    
    page.drawLine({
      start: { x: margin, y: y - 5 },
      end: { x: width - margin, y: y - 5 },
      thickness: 1,
      color: lightBorder,
    });
    
    y -= 25;

    resumeData.pendidikan.forEach((edu: any) => {
      checkNewPage(70);

      page.drawCircle({
        x: margin + 5,
        y: y - 5,
        size: 2,
        color: black,
      });

      page.drawText(edu.penjurusan, {
        x: margin + 15,
        y: y,
        size: 11,
        font: boldFont,
        color: black,
      });
      y -= 18;

      page.drawText(edu.namaSekolah, {
        x: margin + 15,
        y: y,
        size: 10,
        font: regularFont,
        color: black,
      });
      y -= 15;

      const startDate = new Date(edu.tanggalMulai).toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });
      const endDate = edu.tanggalSelesai
        ? new Date(edu.tanggalSelesai).toLocaleDateString("id-ID", {
            month: "short",
            year: "numeric",
          })
        : "Sekarang";

      page.drawText(`${startDate} - ${endDate} | ${edu.lokasi}`, {
        x: margin + 15,
        y: y,
        size: 10,
        font: regularFont,
        color: darkGray,
      });
      y -= 25;
    });
    y -= 10;
  }

  if (resumeData.keterampilan && resumeData.keterampilan.length > 0) {
    checkNewPage(80);

    page.drawText("KETERAMPILAN", {
      x: margin,
      y: y,
      size: 12,
      font: boldFont,
      color: black,
    });
    
    page.drawLine({
      start: { x: margin, y: y - 5 },
      end: { x: width - margin, y: y - 5 },
      thickness: 1,
      color: lightBorder,
    });
    
    y -= 20;

    resumeData.keterampilan.forEach((skill: any) => {
      checkNewPage(20);

      page.drawCircle({
        x: margin + 5,
        y: y - 3,
        size: 1.5,
        color: black,
      });

      const levelText = ["Dasar", "Cukup", "Baik", "Mahir", "Ahli"][skill.level - 1];

      page.drawText(`${skill.namaKeterampilan} - ${levelText}`, {
        x: margin + 15,
        y: y,
        size: 10,
        font: regularFont,
        color: black,
      });
      y -= 15;
    });
    y -= 15;
  }

  if (resumeData.bahasa && resumeData.bahasa.length > 0) {
    checkNewPage(60);

    page.drawText("BAHASA", {
      x: margin,
      y: y,
      size: 12,
      font: boldFont,
      color: black,
    });
    
    page.drawLine({
      start: { x: margin, y: y - 5 },
      end: { x: width - margin, y: y - 5 },
      thickness: 1,
      color: lightBorder,
    });
    
    y -= 20;

    resumeData.bahasa.forEach((lang: any) => {
      checkNewPage(20);

      page.drawCircle({
        x: margin + 5,
        y: y - 3,
        size: 1.5,
        color: black,
      });

      const levelText = ["Dasar", "Cukup", "Baik", "Mahir", "Native"][lang.level - 1];

      page.drawText(`${lang.namaBahasa} - ${levelText}`, {
        x: margin + 15,
        y: y,
        size: 10,
        font: regularFont,
        color: black,
      });
      y -= 15;
    });
    y -= 15;
  }

  if (resumeData.sertifikasiDanLisensi && resumeData.sertifikasiDanLisensi.length > 0) {
    checkNewPage(80);

    page.drawText("SERTIFIKASI DAN LISENSI", {
      x: margin,
      y: y,
      size: 12,
      font: boldFont,
      color: black,
    });
    
    page.drawLine({
      start: { x: margin, y: y - 5 },
      end: { x: width - margin, y: y - 5 },
      thickness: 1,
      color: lightBorder,
    });
    
    y -= 20;

    resumeData.sertifikasiDanLisensi.forEach((cert: any) => {
      checkNewPage(40);

      page.drawCircle({
        x: margin + 5,
        y: y - 3,
        size: 1.5,
        color: black,
      });

      page.drawText(cert.namaSertifikasi, {
        x: margin + 15,
        y: y,
        size: 10,
        font: regularFont,
        color: black,
      });
      y -= 15;

      if (cert.kredensialSertifikasi) {
        page.drawText(`Kredensial: ${cert.kredensialSertifikasi}`, {
          x: margin + 15,
          y: y,
          size: 10,
          font: regularFont,
          color: darkGray,
        });
        y -= 15;
      }
      y -= 5;
    });
    y -= 10;
  }

  if (resumeData.situsWebDanMediaSosial && resumeData.situsWebDanMediaSosial.length > 0) {
    checkNewPage(60);

    page.drawText("MEDIA SOSIAL DAN WEBSITE", {
      x: margin,
      y: y,
      size: 12,
      font: boldFont,
      color: black,
    });
    
    page.drawLine({
      start: { x: margin, y: y - 5 },
      end: { x: width - margin, y: y - 5 },
      thickness: 1,
      color: lightBorder,
    });
    
    y -= 20;

    resumeData.situsWebDanMediaSosial.forEach((social: any) => {
      checkNewPage(30);

      page.drawCircle({
        x: margin + 5,
        y: y - 3,
        size: 1.5,
        color: black,
      });

      page.drawText(`${social.namaMediaSosial}: ${social.linkMediaSosial}`, {
        x: margin + 15,
        y: y,
        size: 10,
        font: regularFont,
        color: black,
      });
      y -= 15;
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

async function handler(
  req: NextApiRequest & { userId?: string },
  res: NextApiResponse,
) {
  await mongoConnect();
  const userId = req.userId;

  switch (req.method) {
    case "POST":
      try {
        const newResume = await Resume.create({
          userId,
          ...req.body,
        });

        const pdfBytes = await generateResumePDF(newResume);

        const base64Data = Buffer.from(pdfBytes).toString("base64");
        const dataUri = `data:application/pdf;base64,${base64Data}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          resource_type: "raw",
          folder: "resumes",
          public_id: `resume-${newResume._id}`,
          type: "upload",
          access_mode: "public",
        });

        const resumeLink = cloudinary.url(`resumes/resume-${newResume._id}`, {
          resource_type: "raw",
          type: "upload",
          flags: "attachment",
        });

        newResume.resumeLink = resumeLink;
        await newResume.save();

        return res.status(201).json({
          message: "Resume berhasil dibuat dan PDF disimpan",
          data: newResume,
        });
      } catch (error: any) {
        console.error("Error creating resume:", error);
        return res.status(400).json({
          message: "Gagal membuat resume",
          error: error.message,
        });
      }

    case "GET":
      try {
        const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({
          message: "Berhasil mengambil semua resume",
          data: resumes,
        });
      } catch (error: any) {
        console.error("Error fetching resumes:", error);
        return res.status(500).json({
          message: "Gagal mengambil resume",
          error: error.message,
        });
      }

    default:
      return res.status(405).json({ message: "Metode tidak diizinkan" });
  }
}

export default verifyAuth(enableCors(handler));
