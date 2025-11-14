// @/pages/index.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bot, Users } from "lucide-react";
import Splash from "@/components/Splash";

const Hero = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); // 5 detik

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <Splash />;

  return (
    <div className="p-3 sm:p-6 lg:p-8 min-h-screen flex flex-col gap-5 sm:gap-6 lg:gap-8 justify-center items-center">
      <Image
        src="/branding/logo.png"
        alt="Mintrix Logo"
        width={300}
        height={300}
        className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96"
      />
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium text-center">
        Mintrix
      </h1>
      <p className="text-black/50 text-center text-sm sm:text-base lg:text-lg px-4">
        Welcome to Mintrix API Developer Portal!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md sm:max-w-2xl px-4">
        <div className="text-center w-full p-4 sm:p-5 bg-[var(--color-primary)] rounded-full">
          <Link
            className="font-medium text-white text-sm sm:text-base flex items-center justify-center gap-2"
            href="https://dino.yogawanadityapratama.com"
          >
            <Bot size={20} />
            Mintrix Dino AI LLM
          </Link>
        </div>
        <div className="text-center w-full p-4 sm:p-5 border border-[var(--color-primary)] rounded-full">
          <Link
            className="font-medium text-[var(--color-primary)] text-sm sm:text-base flex items-center justify-center gap-2"
            href="/parent/690b4935312fdb7fb72ee5c9"
          >
            <Users size={20} />
            Mintrix Student Monitoring
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
