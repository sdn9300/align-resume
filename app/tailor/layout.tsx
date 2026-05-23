import { TailorShell } from "@/components/TailorShell";

export default function TailorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TailorShell>{children}</TailorShell>;
}
