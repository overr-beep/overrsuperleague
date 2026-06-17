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
      className="game-button-secondary"
    >
      {children}
    </Link>
  );
}
