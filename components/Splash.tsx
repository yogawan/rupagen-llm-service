// @/components/Splash.tsx
import Image from "next/image";

const Splash = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex justify-center items-center">
      <Image src="/branding/aws.png" alt="Logo" width={256} height={256} />
    </div>
  );
};

export default Splash;
