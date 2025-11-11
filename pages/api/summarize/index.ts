// @/pages/api/summarize/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "@/middleware/verifyAuth";
import { enableCors } from "@/middleware/enableCors";

async function fetchAPI(endpoint: string, token: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mintrix.yogawanadityapratama.com';
    const response = await fetch(`${baseUrl}/api/${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${endpoint}:`, await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function handler(
  req: NextApiRequest & { userId?: string },
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Metode tidak diizinkan" });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    // Fetch all data in parallel
    const [
      profileData,
      personalizationData,
      notesData,
      statsData,
      leaderboardData,
      missionData,
      progressData,
    ] = await Promise.all([
      fetchAPI('profile', token),
      fetchAPI('personalization', token),
      fetchAPI('notes', token),
      fetchAPI('stats', token),
      fetchAPI('leaderboard', token),
      fetchAPI('mission', token),
      fetchAPI('progress', token),
    ]);

    const profile = profileData?.data || null;
    const personalization = personalizationData?.data?.[0] || null;
    const notes = notesData?.data || [];
    const stats = statsData?.stats || null;
    const leaderboard = leaderboardData?.data || [];
    const mission = missionData?.data || null;
    const progress = progressData?.data || null;

    const summaryLines = [
      'Profile',
      `- Nama: ${profile?.nama || 'Tidak tersedia'}`,
      `- Email: ${profile?.email || 'Tidak tersedia'}`,
      `- Personalisasi: ${profile?.personalization ? 'Sudah diatur' : 'Belum diatur'}`,
      `- Foto: ${profile?.foto ? 'Ada' : 'Tidak ada'}`,
      '',
      'Personalisasi User',
      `- Waktu Belajar: ${personalization?.waktuBelajar || 'Tidak tersedia'}`,
      `- Kelebihan: ${personalization?.kelebihan?.join(', ') || 'Tidak tersedia'}`,
      `- Kekurangan: ${personalization?.kekurangan?.join(', ') || 'Tidak tersedia'}`,
      `- Cerita Singkat: ${personalization?.ceritaSingkat || 'Tidak tersedia'}`,
      '',
      'Catatan User',
      `- Total Catatan: ${notes.length} catatan`,
      `- Catatan Terbaru: ${notes[0]?.catatan || 'Tidak ada catatan'}`,
      '',
      'Stats User',
      `- Streak: ${stats?.streakActive ? `Aktif (${stats?.streakCount} hari)` : 'Tidak aktif'}`,
      `- Point: ${stats?.point || 0}`,
      `- XP: ${stats?.xp || 0}`,
      `- Liga: ${stats?.liga || 'Tidak ada'}`,
      '',
      'Leaderboard',
      `- Total Peserta: ${leaderboard.length} orang`,
      `- Peringkat 1: ${leaderboard[0]?.nama || 'Tidak ada'} (${leaderboard[0]?.xp || 0} XP)`,
      `- Peringkat 2: ${leaderboard[1]?.nama || 'Tidak ada'} (${leaderboard[1]?.xp || 0} XP)`,
      `- Peringkat 3: ${leaderboard[2]?.nama || 'Tidak ada'} (${leaderboard[2]?.xp || 0} XP)`,
      '',
      'Misi Harian User',
      `- Ajak Ngobrol Dino: ${mission?.ajakNgobrolDino ? 'Selesai' : 'Belum selesai'}`,
      `- Lakukan Hobimu Hari Ini: ${mission?.lakukanHobimuHariIni ? 'Selesai' : 'Belum selesai'}`,
      `- Hubungkan Akun dengan Orang Tua: ${mission?.hubungkanAkunmuDenganOrangTua ? 'Selesai' : 'Belum selesai'}`,
      `- Point Misi: ${mission?.point || 0}`,
      '',
      'Progres Game User',
      `- Total Modul: ${progress?.moduls?.length || 0}`,
      `- Modul Aktif: ${progress?.moduls?.[0]?.nama || 'Tidak ada'}`,
      `- Bagian Progress: ${progress?.moduls?.[0]?.bagian?.filter((b: any) => b.progress > 0).length || 0} dari ${progress?.moduls?.[0]?.bagian?.length || 0}`,
    ];

    return res.status(200).json({
      message: "Berhasil mengambil semua data",
      summary: summaryLines.join('\n'),
    });
  } catch (error: any) {
    console.error("Error summarizing data:", error);
    return res.status(500).json({
      message: "Gagal mengambil data",
      error: error.message,
    });
  }
}

export default enableCors(verifyAuth(handler));