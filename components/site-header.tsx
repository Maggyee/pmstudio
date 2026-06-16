import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-3 py-3 sm:px-5">
      <div className="liquid-glass mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full px-4 sm:px-5 lg:px-7">
        <BrandMark />
        <nav className="hidden items-center gap-2 rounded-full bg-white/28 p-1 text-sm font-medium text-[#4d4d4d] md:flex">
          <Link className="rounded-full px-4 py-2 transition hover:bg-white/60 hover:text-black" href="/#workflow">
            工作流
          </Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white/60 hover:text-black" href="/#alignment">
            PRD 生成原型
          </Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white/60 hover:text-black" href="/app/projects/demo">
            示例项目
          </Link>
        </nav>
        <Link className={buttonVariants({ size: "sm" })} href="/app">
          开始生成
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
