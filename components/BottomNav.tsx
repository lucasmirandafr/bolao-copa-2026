"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BallIcon, LiveIcon, NotesIcon, TrophyIcon, UserIcon } from "@/components/icons";

const ITEMS = [
  { href: "/", label: "Jogos", Icon: BallIcon },
  { href: "/ao-vivo", label: "Ao vivo", Icon: LiveIcon },
  { href: "/palpites", label: "Palpites", Icon: NotesIcon },
  { href: "/ranking", label: "Ranking", Icon: TrophyIcon },
  { href: "/perfil", label: "Perfil", Icon: UserIcon },
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
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                active ? "text-green-600" : "text-zinc-400"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
