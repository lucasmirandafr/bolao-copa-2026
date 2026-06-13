"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Jogos", icon: "⚽" },
  { href: "/ao-vivo", label: "Ao vivo", icon: "🔴" },
  { href: "/ranking", label: "Ranking", icon: "🏆" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

const HIDDEN_PATHS = ["/login", "/cadastro"];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <nav className="sticky bottom-0 z-10 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                active ? "text-green-600" : "text-zinc-400"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
