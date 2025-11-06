// @/pages/parent/[id]/index.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Splash from "@/components/Splash";
import Image from "next/image";

const ParentPage = () => {
  const { id } = useRouter().query;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Splash />;
  if (!data) return <p>Data not found</p>;

  const { user, stats, personality } = data;

  return (
    <div style={{ padding: "20px" }}>
      <img
        src={user.foto}
        alt={user.nama}
        width={120}
        style={{ borderRadius: 10 }}
      />
      <p>
        <strong>Nama:</strong> {user.nama}
      </p>
      <p>
        <strong>Id:</strong> {user._id}
      </p>

      <div className="flex gap-5">
        <p>
          <strong>Liga:</strong> {stats.liga}
        </p>
        <p>
          <strong>XP:</strong> {stats.xp}
        </p>
        <p>
          <strong>Runtutan Hari:</strong> {stats.streakCount}
        </p>
      </div>

      <h2 className="mt-5 text-xl font-bold">Kepripadian Kamu</h2>
      <div>
        <p>
          Data di bawah ini merupakan rekam jejak penggunaan aplikasi dari awal
          hingga saat ini dan dapat berubah kapanpun. Penilaian yang ditampilkan
          didasarkan pada keseluruhan aktivitas anak.
        </p>
      </div>

      <h2 className="mt-5 text-xl font-bold">Pencapaian</h2>
      <div className="flex">
        <Image
          src="/pencapaian/1.png"
          alt="Pencapaian 1"
          width={120}
          height={120}
        />
        <Image
          src="/pencapaian/2.png"
          alt="Pencapaian 2"
          width={120}
          height={120}
        />
        <Image
          src="/pencapaian/3.png"
          alt="Pencapaian 3"
          width={120}
          height={120}
        />
        <Image
          src="/pencapaian/4.png"
          alt="Pencapaian 4"
          width={120}
          height={120}
        />
        <Image
          src="/pencapaian/5.png"
          alt="Pencapaian 5"
          width={120}
          height={120}
        />
        <Image
          src="/pencapaian/6.png"
          alt="Pencapaian 6"
          width={120}
          height={120}
        />
      </div>

      <h2 className="mt-5 text-xl font-bold">Perkembangan</h2>
      <div>
        <p>
          <strong>Kreatifitas:</strong> {personality.kreatifitas}
        </p>
        <p>
          <strong>Keberanian:</strong> {personality.keberanian}
        </p>
        <p>
          <strong>Empati:</strong> {personality.empati}
        </p>
        <p>
          <strong>Kerja Sama:</strong> {personality.kerjaSama}
        </p>
        <p>
          <strong>Tanggung Jawab:</strong> {personality.tanggungJawab}
        </p>

        <h2 className="mt-5 text-xl font-bold">Hobi & Minat Kamu</h2>
        <div>
          <p>{personality.hobiDanMinat}</p>
        </div>

        <h2 className="mt-5 text-xl font-bold">Sifat dan kepribadian</h2>
        <div>
          <p>
            Kamu lebih nyaman dan bersemangat saat punya waktu untuk sendiri dan
            merenung. memiliki banyak ide unik, mandiri, dan sangat teliti
            dengan hasil kerjanya.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
