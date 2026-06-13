"use client";

import { useState, type ReactNode } from "react";

type Props = {
  usersTab: ReactNode;
  devTab: ReactNode;
};

export default function AdminTabs({ usersTab, devTab }: Props) {
  const [tab, setTab] = useState<"users" | "dev">("users");

  return (
    <div>
      <div className="mb-4 flex gap-2 border-b border-zinc-200">
        <button
          type="button"
          onClick={() => setTab("users")}
          className={`px-3 py-2 text-sm font-semibold ${
            tab === "users"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-zinc-400"
          }`}
        >
          Gerenciar usuários
        </button>
        <button
          type="button"
          onClick={() => setTab("dev")}
          className={`px-3 py-2 text-sm font-semibold ${
            tab === "dev"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-zinc-400"
          }`}
        >
          Dev / código
        </button>
      </div>

      {tab === "users" ? usersTab : devTab}
    </div>
  );
}
