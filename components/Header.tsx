import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex w-full justify-center pt-8 pb-4">
      <Link
        href="/"
        className="group flex items-center gap-3 transition-opacity duration-200 hover:opacity-95"
      >
        <div className="relative flex h-11 w-11 items-center justify-center">
          <Image
            src="/logo.svg"
            alt="AlignResume Logo"
            width={44}
            height={44}
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#4A3E3D] sm:text-3xl">
          Align<span className="font-semibold text-[#5C4E43]">Resume</span>
        </span>
      </Link>
    </header>
  );
}
