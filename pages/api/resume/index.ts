import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/middleware/verifyAuth";
import { enableCors } from "@/middleware/enableCors";
import { mongoConnect } from "@/lib/mongoConnect";
import Resume from "@/models/Resume";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function generateResumePDF(resumeData: any) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  // Embed fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Color scheme - Professional blue theme
  const primaryDark = rgb(0.24, 0.58, 0.71);
  const primaryBlue = rgb(0.24, 0.58, 0.71); // #3D94B5
  const accentBlue = rgb(0.34, 0.68, 0.81); // Lighter complementary blue
  const textDark = rgb(0.2, 0.2, 0.2);
  const textGray = rgb(0.4, 0.4, 0.4);
  const lightBg = rgb(0.96, 0.97, 0.98);
  const white = rgb(1, 1, 1);

  const margin = 50;
  const sidebarWidth = 180;
  const contentX = margin + sidebarWidth + 20;
  const contentWidth = width - contentX - margin;
  let y = height - margin;
  let currentPage = page;

  // Helper function to check if new page is needed
  const checkNewPage = (spaceNeeded: number) => {
    if (y < margin + spaceNeeded) {
      page = pdfDoc.addPage([595.28, 841.89]);
      currentPage = page;
      y = height - margin;

      // Redraw sidebar on new page
      page.drawRectangle({
        x: 0,
        y: 0,
        width: margin + sidebarWidth,
        height: height,
        color: primaryDark,
      });

      return true;
    }
    return false;
  };

  // Draw left sidebar
  page.drawRectangle({
    x: 0,
    y: 0,
    width: margin + sidebarWidth,
    height: height,
    color: primaryDark,
  });

  const kontak = resumeData.kontak;

  // ========== HEADER SECTION ==========
  // Name section with accent background
  page.drawRectangle({
    x: margin + sidebarWidth,
    y: height - 120,
    width: width - (margin + sidebarWidth),
    height: 120,
    color: lightBg,
  });

  // Draw vertical accent line
  page.drawRectangle({
    x: margin + sidebarWidth,
    y: height - 120,
    width: 4,
    height: 120,
    color: primaryBlue,
  });

  // Full Name
  const fullName = `${kontak.namaAwal} ${kontak.namaAkhir}`.toUpperCase();
  page.drawText(fullName, {
    x: contentX,
    y: height - 60,
    size: 26,
    font: boldFont,
    color: primaryDark,
  });

  // Job Title
  page.drawText(kontak.jabatanYangDiinginkan, {
    x: contentX,
    y: height - 85,
    size: 13,
    font: regularFont,
    color: primaryBlue,
  });

  // Horizontal line under job title
  page.drawLine({
    start: { x: contentX, y: height - 92 },
    end: { x: contentX + 150, y: height - 92 },
    thickness: 2,
    color: primaryBlue,
  });

  y = height - 140;

  // ========== SIDEBAR CONTENT ==========
  let sidebarY = height - 80;
  const sidebarX = margin;
  const sidebarContentWidth = sidebarWidth - 20;

  // Contact Information in sidebar
  page.drawText("KONTAK", {
    x: sidebarX,
    y: sidebarY,
    size: 11,
    font: boldFont,
    color: white,
  });

  // Underline for section
  page.drawLine({
    start: { x: sidebarX, y: sidebarY - 3 },
    end: { x: sidebarX + sidebarContentWidth, y: sidebarY - 3 },
    thickness: 1,
    color: primaryBlue,
  });

  sidebarY -= 25;

  // Email
  page.drawText("Email", {
    x: sidebarX,
    y: sidebarY,
    size: 8,
    font: boldFont,
    color: accentBlue,
  });
  sidebarY -= 12;

  const emailLines =
    kontak.email.length > 25
      ? [kontak.email.substring(0, 25), kontak.email.substring(25)]
      : [kontak.email];

  emailLines.forEach((line) => {
    page.drawText(line, {
      x: sidebarX,
      y: sidebarY,
      size: 8,
      font: regularFont,
      color: white,
    });
    sidebarY -= 10;
  });

  sidebarY -= 8;

  // Phone
  page.drawText("Telepon", {
    x: sidebarX,
    y: sidebarY,
    size: 8,
    font: boldFont,
    color: accentBlue,
  });
  sidebarY -= 12;
  page.drawText(kontak.nomorTelepon, {
    x: sidebarX,
    y: sidebarY,
    size: 8,
    font: regularFont,
    color: white,
  });

  sidebarY -= 18;

  // Address
  page.drawText("Alamat", {
    x: sidebarX,
    y: sidebarY,
    size: 8,
    font: boldFont,
    color: accentBlue,
  });
  sidebarY -= 12;
  page.drawText(kontak.kota, {
    x: sidebarX,
    y: sidebarY,
    size: 8,
    font: regularFont,
    color: white,
  });
  sidebarY -= 10;
  page.drawText(kontak.negara, {
    x: sidebarX,
    y: sidebarY,
    size: 8,
    font: regularFont,
    color: white,
  });

  sidebarY -= 30;

  // Skills in sidebar
  if (resumeData.keterampilan && resumeData.keterampilan.length > 0) {
    page.drawText("KETERAMPILAN", {
      x: sidebarX,
      y: sidebarY,
      size: 11,
      font: boldFont,
      color: white,
    });

    page.drawLine({
      start: { x: sidebarX, y: sidebarY - 3 },
      end: { x: sidebarX + sidebarContentWidth, y: sidebarY - 3 },
      thickness: 1,
      color: primaryBlue,
    });

    sidebarY -= 20;

    resumeData.keterampilan.forEach((skill: any) => {
      // Skill name
      const skillName =
        skill.namaKeterampilan.length > 22
          ? skill.namaKeterampilan.substring(0, 22) + "..."
          : skill.namaKeterampilan;

      page.drawText(skillName, {
        x: sidebarX,
        y: sidebarY,
        size: 8,
        font: regularFont,
        color: white,
      });
      sidebarY -= 10;

      // Skill level dots
      const dotSize = 4;
      const dotSpacing = 8;
      for (let i = 0; i < 5; i++) {
        page.drawCircle({
          x: sidebarX + i * dotSpacing + dotSize,
          y: sidebarY + 3,
          size: dotSize / 2,
          color: i < skill.level ? accentBlue : rgb(0.4, 0.4, 0.4),
        });
      }

      sidebarY -= 15;
    });

    sidebarY -= 10;
  }

  // Languages in sidebar
  if (resumeData.bahasa && resumeData.bahasa.length > 0) {
    page.drawText("BAHASA", {
      x: sidebarX,
      y: sidebarY,
      size: 11,
      font: boldFont,
      color: white,
    });

    page.drawLine({
      start: { x: sidebarX, y: sidebarY - 3 },
      end: { x: sidebarX + sidebarContentWidth, y: sidebarY - 3 },
      thickness: 1,
      color: primaryBlue,
    });

    sidebarY -= 20;

    resumeData.bahasa.forEach((lang: any) => {
      const levelText = ["Dasar", "Cukup", "Baik", "Mahir", "Native"][
        lang.level - 1
      ];

      page.drawText(lang.namaBahasa, {
        x: sidebarX,
        y: sidebarY,
        size: 8,
        font: regularFont,
        color: white,
      });
      sidebarY -= 10;

      page.drawText(levelText, {
        x: sidebarX,
        y: sidebarY,
        size: 7,
        font: italicFont,
        color: accentBlue,
      });

      sidebarY -= 15;
    });
  }

  // ========== MAIN CONTENT AREA ==========

  // Summary Section
  if (resumeData.ringkasan) {
    page.drawText("RINGKASAN PROFESIONAL", {
      x: contentX,
      y: y,
      size: 12,
      font: boldFont,
      color: primaryDark,
    });

    page.drawLine({
      start: { x: contentX, y: y - 3 },
      end: { x: width - margin, y: y - 3 },
      thickness: 1.5,
      color: primaryBlue,
    });

    y -= 20;

    // Wrap text for summary
    const words = resumeData.ringkasan.split(" ");
    let line = "";

    words.forEach((word: string, idx: number) => {
      const testLine = line + (line ? " " : "") + word;
      const textWidth = regularFont.widthOfTextAtSize(testLine, 10);

      if (textWidth > contentWidth && line) {
        page.drawText(line, {
          x: contentX,
          y: y,
          size: 10,
          font: regularFont,
          color: textDark,
        });
        y -= 14;
        line = word;
      } else {
        line = testLine;
      }

      if (idx === words.length - 1 && line) {
        page.drawText(line, {
          x: contentX,
          y: y,
          size: 10,
          font: regularFont,
          color: textDark,
        });
        y -= 14;
      }
    });

    y -= 15;
  }

  // Experience Section
  if (resumeData.pengalaman && resumeData.pengalaman.length > 0) {
    checkNewPage(100);

    page.drawText("PENGALAMAN KERJA", {
      x: contentX,
      y: y,
      size: 12,
      font: boldFont,
      color: primaryDark,
    });

    page.drawLine({
      start: { x: contentX, y: y - 3 },
      end: { x: width - margin, y: y - 3 },
      thickness: 1.5,
      color: primaryBlue,
    });

    y -= 25;

    resumeData.pengalaman.forEach((exp: any, index: number) => {
      checkNewPage(80);

      // Timeline dot
      page.drawCircle({
        x: contentX - 8,
        y: y + 4,
        size: 3,
        color: primaryBlue,
      });

      // Job title
      page.drawText(exp.jabatan, {
        x: contentX,
        y: y,
        size: 11,
        font: boldFont,
        color: primaryDark,
      });
      y -= 15;

      // Company name
      page.drawText(exp.perusahaan, {
        x: contentX,
        y: y,
        size: 10,
        font: boldFont,
        color: primaryBlue,
      });
      y -= 14;

      // Date and location
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
        x: contentX,
        y: y,
        size: 9,
        font: italicFont,
        color: textGray,
      });
      y -= 16;

      // Description
      if (exp.deskripsi) {
        const descWords = exp.deskripsi.split(" ");
        let descLine = "";

        descWords.forEach((word: string, idx: number) => {
          const testLine = descLine + (descLine ? " " : "") + word;
          const textWidth = regularFont.widthOfTextAtSize(testLine, 9);

          if (textWidth > contentWidth - 10 && descLine) {
            page.drawText(descLine, {
              x: contentX + 5,
              y: y,
              size: 9,
              font: regularFont,
              color: textDark,
            });
            y -= 12;
            descLine = word;
          } else {
            descLine = testLine;
          }

          if (idx === descWords.length - 1 && descLine) {
            page.drawText(descLine, {
              x: contentX + 5,
              y: y,
              size: 9,
              font: regularFont,
              color: textDark,
            });
            y -= 12;
          }
        });
      }

      y -= 15;
    });

    y -= 10;
  }

  // Education Section
  if (resumeData.pendidikan && resumeData.pendidikan.length > 0) {
    checkNewPage(100);

    page.drawText("PENDIDIKAN", {
      x: contentX,
      y: y,
      size: 12,
      font: boldFont,
      color: primaryDark,
    });

    page.drawLine({
      start: { x: contentX, y: y - 3 },
      end: { x: width - margin, y: y - 3 },
      thickness: 1.5,
      color: primaryBlue,
    });

    y -= 25;

    resumeData.pendidikan.forEach((edu: any) => {
      checkNewPage(70);

      // Timeline dot
      page.drawCircle({
        x: contentX - 8,
        y: y + 4,
        size: 3,
        color: primaryBlue,
      });

      // Degree
      page.drawText(edu.penjurusan, {
        x: contentX,
        y: y,
        size: 11,
        font: boldFont,
        color: primaryDark,
      });
      y -= 15;

      // School name
      page.drawText(edu.namaSekolah, {
        x: contentX,
        y: y,
        size: 10,
        font: regularFont,
        color: primaryBlue,
      });
      y -= 14;

      // Date and location
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
        x: contentX,
        y: y,
        size: 9,
        font: italicFont,
        color: textGray,
      });
      y -= 20;
    });

    y -= 10;
  }

  // Certifications Section
  if (
    resumeData.sertifikasiDanLisensi &&
    resumeData.sertifikasiDanLisensi.length > 0
  ) {
    checkNewPage(80);

    page.drawText("SERTIFIKASI & LISENSI", {
      x: contentX,
      y: y,
      size: 12,
      font: boldFont,
      color: primaryDark,
    });

    page.drawLine({
      start: { x: contentX, y: y - 3 },
      end: { x: width - margin, y: y - 3 },
      thickness: 1.5,
      color: primaryBlue,
    });

    y -= 20;

    resumeData.sertifikasiDanLisensi.forEach((cert: any) => {
      checkNewPage(40);

      // Bullet point
      page.drawCircle({
        x: contentX + 3,
        y: y + 3,
        size: 2,
        color: primaryBlue,
      });

      page.drawText(cert.namaSertifikasi, {
        x: contentX + 10,
        y: y,
        size: 10,
        font: regularFont,
        color: textDark,
      });
      y -= 12;

      if (cert.kredensialSertifikasi) {
        page.drawText(`Kredensial: ${cert.kredensialSertifikasi}`, {
          x: contentX + 10,
          y: y,
          size: 8,
          font: italicFont,
          color: textGray,
        });
        y -= 15;
      } else {
        y -= 5;
      }
    });

    y -= 10;
  }

  // Social Media Section
  if (
    resumeData.situsWebDanMediaSosial &&
    resumeData.situsWebDanMediaSosial.length > 0
  ) {
    checkNewPage(60);

    page.drawText("MEDIA SOSIAL & WEBSITE", {
      x: contentX,
      y: y,
      size: 12,
      font: boldFont,
      color: primaryDark,
    });

    page.drawLine({
      start: { x: contentX, y: y - 3 },
      end: { x: width - margin, y: y - 3 },
      thickness: 1.5,
      color: primaryBlue,
    });

    y -= 20;

    resumeData.situsWebDanMediaSosial.forEach((social: any) => {
      checkNewPage(30);

      page.drawText(`${social.namaMediaSosial}:`, {
        x: contentX,
        y: y,
        size: 9,
        font: boldFont,
        color: textDark,
      });

      const linkText =
        social.linkMediaSosial.length > 50
          ? social.linkMediaSosial.substring(0, 50) + "..."
          : social.linkMediaSosial;

      page.drawText(linkText, {
        x:
          contentX +
          regularFont.widthOfTextAtSize(`${social.namaMediaSosial}: `, 9),
        y: y,
        size: 9,
        font: regularFont,
        color: primaryBlue,
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

        // Convert PDF bytes to base64 for Cloudinary upload
        const base64Data = Buffer.from(pdfBytes).toString('base64');
        const dataUri = `data:application/pdf;base64,${base64Data}`;

        // Upload PDF to Cloudinary as raw file with public access
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          resource_type: "raw",
          folder: "resumes",
          public_id: `resume-${newResume._id}`,
          type: "upload",
          access_mode: "public"
        });

        // Generate URL with fl_attachment for proper PDF viewing
        const resumeLink = cloudinary.url(`resumes/resume-${newResume._id}`, {
          resource_type: "raw",
          type: "upload",
          flags: "attachment"
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
