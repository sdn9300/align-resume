import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex w-full justify-center pt-8 pb-4">
      <Link
        href="/"
        className="group flex items-center transition-opacity duration-200 hover:opacity-95"
      >
        {/* Logo acts as the letter "A" */}
        <div className="relative -mr-1.5 mt-1 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="A"
            width={51}
            height={51}
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#4A3E3D] sm:text-3xl">
          lign<span className="font-semibold text-[#5C4E43]">Resume</span>
        </span>
      </Link>
    </header>
  );
}
