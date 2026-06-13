"use client";

import { Fragment, useState } from "react";
import type { RankingRow } from "@/lib/types";

type Props = {
  rows: RankingRow[];
  currentUserId?: string;
};

export default function RankingTable({ rows, currentUserId }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
        Ainda não há participantes no ranking.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-400">
            <th className="px-2 py-2 font-semibold">#</th>
            <th className="px-2 py-2 font-semibold">Jogador</th>
            <th className="px-2 py-2 text-right font-semibold">Pontos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isCurrentUser = row.user_id === currentUserId;
            const isExpanded = expanded === row.user_id;
            const aproveitamento =
              row.total_palpites > 0 ? (row.total_points / (row.total_palpites * 10)) * 100 : 0;

            return (
              <Fragment key={row.user_id}>
                <tr
                  className={`border-b border-zinc-100 last:border-0 ${
                    isCurrentUser ? "bg-green-50" : ""
                  }`}
                >
                  <td className="px-2 py-2 font-semibold text-zinc-500">{index + 1}</td>
                  <td className="px-2 py-2 font-medium text-zinc-900">
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : row.user_id)}
                      className="flex items-center gap-1.5 text-left"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-xs text-zinc-500 transition-transform ${
                          isExpanded ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                      <span>
                        {row.display_name}
                        {isCurrentUser && (
                          <span className="ml-1 text-xs text-green-600">(você)</span>
                        )}
                      </span>
                    </button>
                  </td>
                  <td className="px-2 py-2 text-right font-bold text-zinc-900">
                    {row.total_points}
                  </td>
                </tr>
                {isExpanded && (
                  <tr
                    className={`border-b border-zinc-100 last:border-0 ${
                      isCurrentUser ? "bg-green-50" : "bg-zinc-50"
                    }`}
                  >
                    <td colSpan={3} className="px-3 py-3">
                      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-zinc-400">Palpites</p>
                          <p className="text-base font-bold text-zinc-900">
                            {row.total_palpites}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-zinc-400">Acertos</p>
                          <p className="text-base font-bold text-zinc-900">
                            {row.total_result}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-zinc-400">Acertos exatos</p>
                          <p className="text-base font-bold text-zinc-900">
                            {row.total_exact}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-zinc-400">Aproveitamento</p>
                          <p className="text-base font-bold text-zinc-900">
                            {aproveitamento.toFixed(0)}%
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-zinc-400">Pontos</p>
                          <p className="text-base font-bold text-zinc-900">
                            {row.total_points}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
