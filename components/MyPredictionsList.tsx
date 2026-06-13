"use client";

import { useEffect, useMemo, useState } from "react";
import type { Match, Prediction } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const dateKeyFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

const FINISH_GRACE_MS = 2.5 * 60 * 60 * 1000;

function isMatchOver(match: Match, now: number | null) {
  if (match.status === "finished") return true;
  if (now === null) return false;
  return now - new Date(match.match_date).getTime() > FINISH_GRACE_MS;
}

function dateKey(date: Date) {
  return dateKeyFormatter.format(date);
}

function dateLabel(key: string, todayKey: string | null, tomorrowKey: string | null) {
  if (key === todayKey) return "Hoje";
  if (key === tomorrowKey) return "Amanhã";
  return key;
}

type Item = { prediction: Prediction; match: Match };

function PredictionCard({ prediction, match }: Item) {
  const isFinished = match.status === "finished";
  const resultColor =
    prediction.points === null
      ? "text-zinc-400"
      : prediction.points > 0
        ? "text-green-600"
        : "text-red-600";

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm">
      <div>
        <p className="font-medium text-zinc-900">
          {match.home_team} x {match.away_team}
        </p>
        <p className="text-xs text-zinc-500">{dateFormatter.format(new Date(match.match_date))}</p>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end gap-2">
          <div>
            <p className="text-[10px] uppercase text-zinc-400">Palpite</p>
            <p className="font-bold text-zinc-900">
              {prediction.home_score} x {prediction.away_score}
            </p>
          </div>
          {isFinished && (
            <div>
              <p className="text-[10px] uppercase text-zinc-400">Real</p>
              <p className={`font-bold ${resultColor}`}>
                {match.home_score} x {match.away_score}
              </p>
            </div>
          )}
        </div>
        {prediction.points !== null && (
          <span
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              prediction.points === 10
                ? "bg-green-100 text-green-700"
                : prediction.points === 5
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {prediction.points === 10 ? "✓ Cravou" : prediction.points === 5 ? "≈ Resultado" : "✗ Errou"}
            {" · "}+{prediction.points} pts
          </span>
        )}
        {match.status === "finished" && prediction.points === null && (
          <p className="text-xs text-zinc-400">Aguardando cálculo</p>
        )}
      </div>
    </div>
  );
}

export default function MyPredictionsList({ items }: { items: Item[] }) {
  const [search, setSearch] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timeout = setTimeout(tick, 0);
    const id = setInterval(tick, 60_000);
    return () => {
      clearTimeout(timeout);
      clearInterval(id);
    };
  }, []);

  const todayKey = now !== null ? dateKey(new Date(now)) : null;
  const tomorrowKey = now !== null ? dateKey(new Date(now + 24 * 60 * 60 * 1000)) : null;

  const searched = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      ({ match }) =>
        match.home_team.toLowerCase().includes(term) ||
        match.away_team.toLowerCase().includes(term)
    );
  }, [items, search]);

  const dateKeys = useMemo(() => {
    const keys: string[] = [];
    for (const { match } of searched) {
      const key = dateKey(new Date(match.match_date));
      if (!keys.includes(key)) keys.push(key);
    }
    return keys;
  }, [searched]);

  const filtered = useMemo(() => {
    if (!selectedDate) return searched;
    return searched.filter(({ match }) => dateKey(new Date(match.match_date)) === selectedDate);
  }, [searched, selectedDate]);

  const open = filtered.filter(({ match }) => !isMatchOver(match, now));
  const finished = filtered.filter(({ match }) => isMatchOver(match, now));

  return (
    <div>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por seleção..."
        className="mb-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />

      {dateKeys.length > 0 && (
        <div className="relative mb-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pr-4">
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap ${
                selectedDate === null
                  ? "bg-green-600 text-white"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              Todos
            </button>
            {dateKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap ${
                  selectedDate === key
                    ? "bg-green-600 text-white"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {dateLabel(key, todayKey, tomorrowKey)}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-zinc-50 to-transparent" />
        </div>
      )}

      {items.length === 0 && (
        <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          Você ainda não deu nenhum palpite.
        </p>
      )}

      {items.length > 0 && filtered.length === 0 && (
        <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          Nenhum jogo encontrado para &quot;{search}&quot;.
        </p>
      )}

      {finished.length > 0 && (
        <details className="group mb-3 rounded-xl border border-zinc-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-700">
            Jogos encerrados ({finished.length})
            <svg
              className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </summary>
          <div className="flex flex-col gap-2 border-t border-zinc-100 p-2">
            {finished.map(({ prediction, match }) => (
              <PredictionCard key={prediction.id} prediction={prediction} match={match} />
            ))}
          </div>
        </details>
      )}

      <div className="flex flex-col gap-2">
        {open.map(({ prediction, match }) => (
          <PredictionCard key={prediction.id} prediction={prediction} match={match} />
        ))}
      </div>
    </div>
  );
}
