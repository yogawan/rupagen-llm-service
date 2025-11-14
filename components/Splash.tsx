// @/components/Splash.tsx
import Image from "next/image";
import { useEffect, useState } from "react";

const Splash = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col justify-center items-center gap-8">
      <Image src="/branding/logo.png" alt="Logo" width={200} height={200} />
      
      {/* Loading Bar */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Loading Text */}
      {/* <p className="text-sm text-black/25">Loading... {progress}%</p> */}
    </div>
  );
};

export default Splash;
