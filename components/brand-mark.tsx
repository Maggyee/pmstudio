import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link className={cn("flex items-center gap-2", className)} href="/">
      <Image
        alt="PM Studio"
        className="h-9 w-9 object-contain"
        height={36}
        src="/pm-studio-logo.png"
        width={36}
      />
      <span className="text-sm font-semibold text-neutral-950">PM Studio</span>
    </Link>
  );
}
