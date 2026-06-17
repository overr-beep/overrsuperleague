import Link from "next/link";
import type { ReactNode } from "react";
import { AuthNav } from "@/components/AuthNav";

const navItems = [
  { href: "/dashboard", label: "Dashboard", code: "HQ" },
  { href: "/my-club", label: "My Club", code: "CLB" },
  { href: "/squad", label: "Squad", code: "XI" },
  { href: "/league", label: "League", code: "TAB" },
  { href: "/schedule", label: "Matches", code: "FIX" },
  { href: "/transfers", label: "Transfers", code: "MKT" },
  { href: "/account", label: "Manager", code: "ID" },
  { href: "/status", label: "Database", code: "DB" },
];

type GameShellProps = {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
};

export function GameShell({
  children,
  title,
  eyebrow = "Overr Super League",
  description,
  actions,
}: GameShellProps) {
  return (
    <main className="game-bg text-white">
      <div className="game-shell">
        <aside className="game-sidebar">
          <div className="flex h-full flex-col p-5">
            <Link href="/" className="block">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-200">
                Overr
              </p>
              <p className="mt-2 text-2xl font-black leading-none text-white">
                Super League
              </p>
            </Link>

            <div className="mt-7 rounded-md border border-teal-300/20 bg-teal-300/10 p-3">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-teal-200">
                Season Control
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-200">
                Private multiplayer career
              </p>
            </div>

            <nav className="mt-7 grid gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm font-bold text-slate-300 transition hover:border-teal-300/30 hover:bg-teal-300/10 hover:text-white"
                >
                  <span className="flex h-8 w-10 items-center justify-center rounded bg-slate-900 text-[0.66rem] font-black text-teal-200 ring-1 ring-white/10 group-hover:bg-teal-300 group-hover:text-slate-950">
                    {item.code}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <AuthNav />
            </div>
          </div>
        </aside>

        <section className="game-main">
          <div className="game-container">
            <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="game-kicker">{eyebrow}</p>
                <h1 className="mt-2 text-4xl font-black leading-none text-white md:text-5xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                    {description}
                  </p>
                ) : null}
              </div>
              {actions ? (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {actions}
                </div>
              ) : null}
            </header>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

export function DataWarning({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
      {message}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "teal" | "amber" | "red";
}) {
  const toneClass = {
    default: "text-white",
    teal: "text-teal-200",
    amber: "text-amber-200",
    red: "text-rose-200",
  }[tone];

  return (
    <section className="game-panel p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-black ${toneClass}`}>{value}</p>
      {detail ? <p className="mt-2 text-sm text-slate-400">{detail}</p> : null}
    </section>
  );
}
