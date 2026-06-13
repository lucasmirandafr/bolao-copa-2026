import type { RankingRow } from "@/lib/types";

type Props = {
  rows: RankingRow[];
  currentUserId?: string;
};

export default function RankingTable({ rows, currentUserId }: Props) {
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
            <th className="px-3 py-2 font-semibold">#</th>
            <th className="px-3 py-2 font-semibold">Jogador</th>
            <th className="px-3 py-2 text-right font-semibold">Cravadas</th>
            <th className="px-3 py-2 text-right font-semibold">Pontos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isCurrentUser = row.user_id === currentUserId;
            return (
              <tr
                key={row.user_id}
                className={`border-b border-zinc-100 last:border-0 ${
                  isCurrentUser ? "bg-green-50" : ""
                }`}
              >
                <td className="px-3 py-2 font-semibold text-zinc-500">{index + 1}</td>
                <td className="px-3 py-2 font-medium text-zinc-900">
                  {row.display_name}
                  {isCurrentUser && <span className="ml-1 text-xs text-green-600">(você)</span>}
                </td>
                <td className="px-3 py-2 text-right text-zinc-600">{row.total_exact}</td>
                <td className="px-3 py-2 text-right font-bold text-zinc-900">
                  {row.total_points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
