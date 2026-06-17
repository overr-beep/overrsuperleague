import Link from "next/link";
import type { ReactNode } from "react";

type NavLinkProps = {
  href: string;
  children: ReactNode;
};

export function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-300/70 hover:bg-emerald-300/10"
    >
      {children}
    </Link>
  );
}
