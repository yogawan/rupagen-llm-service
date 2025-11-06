// @/pages/parent/[id]/index.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Splash from "@/components/Splash";

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
      <h1>Parent Profile Detail</h1>

      {/* USER */}
      <h2>User</h2>
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
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Personalization:</strong> {user.personalization ? "Yes" : "No"}
      </p>

      {/* STATS */}
      <h2>Stats</h2>
      <p>
        <strong>Streak Active:</strong>{" "}
        {stats.streakActive ? "Active" : "Not Active"}
      </p>
      <p>
        <strong>Streak Count:</strong> {stats.streakCount}
      </p>
      <p>
        <strong>Point:</strong> {stats.point}
      </p>
      <p>
        <strong>XP:</strong> {stats.xp}
      </p>
      <p>
        <strong>Liga:</strong> {stats.liga}
      </p>

      {/* PERSONALITY */}
      <h2>Personality</h2>
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
      <p>
        <strong>Hobi & Minat:</strong> {personality.hobiDanMinat}
      </p>
    </div>
  );
};

export default ParentPage;
