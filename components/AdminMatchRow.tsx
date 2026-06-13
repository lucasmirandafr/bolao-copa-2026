"use client";

import { useActionState, useState } from "react";
import { updateMatchResult } from "@/lib/actions/admin";
import { getFlagUrl } from "@/lib/flags";
import type { Match } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function AdminMatchRow({ match }: { match: Match }) {
  const [state, formAction, pending] = useActionState(updateMatchResult, null);
  const [home, setHome] = useState(match.home_score?.toString() ?? "");
  const [away, setAway] = useState(match.away_score?.toString() ?? "");
  const [finished, setFinished] = useState(match.status === "finished");

  return (
    <form
      action={formAction}
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="match_id" value={match.id} />
      <input type="hidden" name="status" value={finished ? "finished" : "scheduled"} />

      <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
        <span className="rounded-full bg-zinc-100 px-2 py-1 font-medium">{match.stage}</span>
        <span>{dateFormatter.format(new Date(match.match_date))}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2">
          {getFlagUrl(match.home_team) && (
            <img
              src={getFlagUrl(match.home_team)!}
              alt=""
              className="h-4 w-6 shrink-0 rounded-sm object-cover"
            />
          )}
          <span className="text-sm font-semibold leading-tight text-zinc-900">
            {match.home_team}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <input
            type="number"
            name="home_score"
            min={0}
            max={99}
            required
            value={home}
            onChange={(e) => setHome(e.target.value)}
            className="h-11 w-12 rounded-lg border border-zinc-300 text-center text-lg font-bold"
            aria-label={`Placar ${match.home_team}`}
          />
          <span className="text-zinc-400">x</span>
          <input
            type="number"
            name="away_score"
            min={0}
            max={99}
            required
            value={away}
            onChange={(e) => setAway(e.target.value)}
            className="h-11 w-12 rounded-lg border border-zinc-300 text-center text-lg font-bold"
            aria-label={`Placar ${match.away_team}`}
          />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="text-right text-sm font-semibold leading-tight text-zinc-900">
            {match.away_team}
          </span>
          {getFlagUrl(match.away_team) && (
            <img
              src={getFlagUrl(match.away_team)!}
              alt=""
              className="h-4 w-6 shrink-0 rounded-sm object-cover"
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 font-medium text-zinc-600">
          <input
            type="checkbox"
            checked={finished}
            onChange={(e) => setFinished(e.target.checked)}
            className="h-4 w-4"
          />
          Jogo finalizado (calcula os pontos)
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-green-600 px-3 py-1.5 font-semibold text-white active:bg-green-700 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {state?.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      {state?.success && <p className="mt-2 text-xs text-green-600">Resultado salvo!</p>}
    </form>
  );
}
