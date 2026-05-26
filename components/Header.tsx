import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full flex justify-center pt-8 pb-4">
      <Link 
        href="/" 
        className="flex items-center group hover:opacity-95 transition-opacity duration-200"
      >
        {/* Logo Container with precision optical alignment */}
        <div className="relative flex items-center justify-center mr-[3px] -translate-y-[1px]">
          <Image
            src="/logo.png" 
            alt="A"
            width={32}  // Slightly adjusted for perfect letter height matching
            height={32}
            className="object-contain drop-shadow-[0_2px_4px_rgba(163,127,51,0.15)]"
            priority
          />
        </div>

        {/* Brand Text */}
        <span className="text-2xl font-bold tracking-tight text-[#4A3E3D] sm:text-3xl select-none">
          lign<span className="font-semibold text-[#5C4E43]">Resume</span>
        </span>
      </Link>
    </header>
  );
}
