// @/pages/index.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Splash from "@/components/Splash";

const HomePage = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); // 5 detik

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <Splash />;

  return (
    <div className="p-3 min-h-screen flex flex-col gap-5 justify-center items-center">
      <Image
        src="/branding/logo.png"
        alt="Mintrix Logo"
        width={300}
        height={300}
      />
      <h1 className="text-7xl font-medium">Mintrix</h1>
      <p className="text-black/50">Welcome to Mintrix API Developer Portal!</p>
      <div className="flex flex-wrap gap-3">
        <div className="text-center w-full p-5 bg-[var(--color-primary)] rounded-full">
          <Link
            className="font-medium text-white"
            href="https://dino.yogawanadityapratama.com"
          >
            Mintrix Dino AI LLM
          </Link>
        </div>
        <div className="text-center w-full p-5 border border-[var(--color-primary)] rounded-full">
          <Link
            className="font-medium text-[var(--color-primary)]"
            href="/parent/690b4935312fdb7fb72ee5c9"
          >
            Mintrix Student Monitoring
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
