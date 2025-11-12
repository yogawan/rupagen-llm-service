// @/pages/parent/[id]/index.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Splash from "@/components/Splash";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

const ParentPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/parent/${id}`);
        setData(res.data.data);
      } catch (error) {
        console.error("Error fetching parent data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const RadarChart = ({ data }: { data: any }) => {
    const categories = [
      { key: "keberanian", label: "Keberanian", angle: 0 },
      { key: "empati", label: "Empati", angle: 72 },
      { key: "tanggungJawab", label: "Tanggung Jawab", angle: 144 },
      { key: "kerjaSama", label: "Kerja Sama", angle: 216 },
      { key: "kreatifitas", label: "Kreatifitas", angle: 288 },
    ];

    const center = 100;
    const maxRadius = 80;
    const levels = 5;

    const getPoint = (value: number, angle: number) => {
      const radius = (value / 100) * maxRadius;
      const radian = (angle - 90) * (Math.PI / 180);
      return {
        x: center + radius * Math.cos(radian),
        y: center + radius * Math.sin(radian),
      };
    };

    const dataPoints = categories.map((cat) =>
      getPoint(data[cat.key] || 0, cat.angle),
    );
    const pathData =
      dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
        .join(" ") + " Z";

    return (
      <div className="flex justify-center my-6">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {[...Array(levels)].map((_, i) => {
            const r = maxRadius * ((i + 1) / levels);
            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            );
          })}

          {categories.map((cat, i) => {
            const end = getPoint(100, cat.angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            );
          })}

          <path
            d={pathData}
            fill="rgba(34, 197, 94, 0.3)"
            stroke="rgb(34, 197, 94)"
            strokeWidth="2"
          />

          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="rgb(34, 197, 94)" />
          ))}

          {categories.map((cat, i) => {
            const labelPoint = getPoint(115, cat.angle);
            return (
              <text
                key={i}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-cyan-500"
                style={{ fontSize: "10px" }}
              >
                {cat.label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  if (loading) return <Splash />;
  if (!data) return <p>Data not found</p>;

  const { user, stats, personality } = data;

  if (showDetail) {
    return (
      <div className="min-h-screen bg-white p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowDetail(false)}
            className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="text-center mb-6">
          <img
            src={user.foto}
            alt={user.nama}
            className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-cyan-400 shadow-lg object-cover"
          />
          <h2 className="text-2xl font-bold text-gray-800">{user.nama}</h2>
          <p className="text-sm text-gray-500">ID: {user._id}</p>
        </div>

        {/* Kepribadian Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-cyan-500 mb-3">
            Kepribadian Kamu
          </h3>
          <p className="text-sm text-gray-700 mb-4 text-justify leading-relaxed">
            Data di bawah ini merupakan rekam jejak penggunaan aplikasi dari
            awal hingga saat ini dan dapat berubah kapanpun. Penilaian yang
            ditampilkan didasarkan pada keseluruhan aktivitas anak.
          </p>

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-cyan-200">
            <p className="text-center text-sm font-semibold text-cyan-500 mb-2">
              Keberanian
            </p>
            <RadarChart data={personality} />
          </div>
        </div>

        {/* Hobi dan Minat */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-cyan-500 mb-3">
            Hobi dan Minat Kamu
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed text-justify">
            {personality.hobiDanMinat ||
              "Menggambar, bermain musik, dan menulis. kamu senang mengarang dan menciptakan dunia dari imaginasi kamu sendiri."}
          </p>
        </div>

        {/* Sifat dan Kepribadian */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-cyan-500 mb-3">
            Sifat dan kepribadian
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed text-justify">
            {personality.sifatDanKepribadian ||
              "Kamu lebih nyaman dan bersemangat saat punya waktu untuk sendiri dan merenung, memiliki banyak ide unik, mandiri, dan sangat teliti dengan hasil kerjanya."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 max-w-md mx-auto"
      style={{
        backgroundImage: "url(/bg-main.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Profile Section */}
      <div className="text-center mb-6">
        <img
          src={user.foto}
          alt={user.nama}
          className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-cyan-400 shadow-lg object-cover"
          width={96}
          height={96}
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.nama}</h2>
        <p className="text-sm text-gray-500 mb-4">ID: {user._id}</p>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-cyan-300 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <Image
              src="/liga_emas.png"
              alt="Liga"
              width={48}
              height={48}
              className="mb-1"
            />
            <p className="text-xs text-gray-500">Liga</p>
            <p className="text-lg font-bold text-yellow-500">{stats.liga}</p>
          </div>
          <div className="flex flex-col items-center border-x border-gray-200">
            <Image
              src="/xp.png"
              alt="Liga"
              width={48}
              height={48}
              className="mb-1"
            />
            <p className="text-xs text-gray-500">Total XP</p>
            <p className="text-lg font-bold text-gray-700">{stats.xp}</p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/fire.png"
              alt="Liga"
              width={48}
              height={48}
              className="mb-1"
            />
            <p className="text-xs text-gray-500">Runtutan hari</p>
            <p className="text-lg font-bold text-gray-700">
              {stats.streakCount}
            </p>
          </div>
        </div>
      </div>

      {/* Pencapaian Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-700">Pencapaian</h3>
          <button className="text-sm text-gray-400 hover:text-gray-600">
            Lihat detail
          </button>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-cyan-300">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="flex justify-center">
                <Image
                  src={`/pencapaian/${num}.png`}
                  alt={`Pencapaian ${num}`}
                  width={80}
                  height={80}
                  className="hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Perkembangan Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-cyan-500">Perkembangan</h3>
          <button
            onClick={() => setShowDetail(true)}
            className="text-sm text-gray-400 hover:text-cyan-500 cursor-pointer transition-colors"
          >
            Lihat detail
          </button>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-cyan-300">
          <p className="text-center text-sm font-semibold text-cyan-500 mb-2">
            Keberanian
          </p>
          <RadarChart data={personality} />
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
