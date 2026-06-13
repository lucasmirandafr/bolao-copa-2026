"use client";

import { useActionState, useEffect, useState } from "react";
import { confirmPrediction, savePrediction } from "@/lib/actions/predictions";
import { updateMatchResult, setMatchLatePredictions } from "@/lib/actions/admin";
import { getFlagUrl } from "@/lib/flags";
import type { Match, Prediction } from "@/lib/types";

type Props = {
  match: Match;
  prediction: Prediction | null;
  isAdmin?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (days > 0 || hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}min`);
  return parts.join(" ");
}

export default function MatchCard({ match, prediction, isAdmin }: Props) {
  const [state, formAction, pending] = useActionState(savePrediction, null);
  const [confirmState, confirmAction, confirming] = useActionState(confirmPrediction, null);
  const [adminState, adminAction, adminPending] = useActionState(updateMatchResult, null);
  const [lateState, lateAction, latePending] = useActionState(setMatchLatePredictions, null);
  const [home, setHome] = useState(prediction?.home_score?.toString() ?? "");
  const [away, setAway] = useState(prediction?.away_score?.toString() ?? "");
  const [resultHome, setResultHome] = useState(match.home_score?.toString() ?? "");
  const [resultAway, setResultAway] = useState(match.away_score?.toString() ?? "");
  const [resultFinished, setResultFinished] = useState(match.status === "finished");
  const [allowLate, setAllowLate] = useState(match.allow_late_predictions);
  const [now, setNow] = useState<number | null>(null);
  const saveFormId = `save-prediction-${match.id}`;
  const confirmFormId = `confirm-prediction-${match.id}`;
  const adminFormId = `admin-result-${match.id}`;
  const lateFormId = `admin-late-${match.id}`;

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timeout = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(timeout);
      clearInterval(id);
    };
  }, []);

  const matchTime = new Date(match.match_date).getTime();
  const opensAt = matchTime - 6 * 60 * 60 * 1000;
  const isFinished = match.status === "finished";
  // Palpites tardios liberados pelo admin só valem para quem ainda não
  // registrou um palpite nesse jogo (a regra de edição não muda).
  const lateAllowed = match.allow_late_predictions && !prediction;
  const notOpenYet = now !== null && !isFinished && !lateAllowed && now < opensAt;
  const isOpen =
    now !== null && !isFinished && (lateAllowed || (now >= opensAt && now < matchTime));
  const locked = now === null || isFinished || !isOpen;

  const isDraft = !!prediction && !prediction.confirmed;
  const isConfirmed = !!prediction?.confirmed;
  const inputsDisabled = locked || isConfirmed;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
        <span className="rounded-full bg-zinc-100 px-2 py-1 font-medium">{match.stage}</span>
        <span>{dateFormatter.format(new Date(match.match_date))}</span>
      </div>

      <form id={saveFormId} action={formAction}>
        <input type="hidden" name="match_id" value={match.id} />

        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            {getFlagUrl(match.home_team) && (
              <img
                src={getFlagUrl(match.home_team)!}
                alt=""
                className="h-4 w-6 shrink-0 rounded-sm object-cover"
              />
            )}
            <span className="text-left text-sm font-semibold leading-tight text-zinc-900">
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
              disabled={inputsDisabled}
              value={home}
              onChange={(e) => setHome(e.target.value)}
              className="h-11 w-12 rounded-lg border border-zinc-300 text-center text-lg font-bold disabled:bg-zinc-100 disabled:text-zinc-400"
              aria-label={`Placar ${match.home_team}`}
            />
            <span className="text-zinc-400">x</span>
            <input
              type="number"
              name="away_score"
              min={0}
              max={99}
              required
              disabled={inputsDisabled}
              value={away}
              onChange={(e) => setAway(e.target.value)}
              className="h-11 w-12 rounded-lg border border-zinc-300 text-center text-lg font-bold disabled:bg-zinc-100 disabled:text-zinc-400"
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
      </form>

      <form id={confirmFormId} action={confirmAction}>
        <input type="hidden" name="match_id" value={match.id} />
      </form>

      <div className="mt-3 flex min-h-6 items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isFinished && (
            <span className="font-medium text-zinc-600">
              Resultado: {match.home_score} x {match.away_score}
            </span>
          )}
          {!isFinished && notOpenYet && (
            <>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-500">
                Fechado
              </span>
              <span className="text-zinc-400">
                Abre em {formatCountdown(opensAt - (now ?? opensAt))}
              </span>
            </>
          )}
          {isOpen && (
            <>
              <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                Aberto
              </span>
              {lateAllowed && now !== null && now >= matchTime ? (
                <span className="text-zinc-400">Palpites liberados pelo admin</span>
              ) : (
                <span className="text-zinc-400">
                  Encerra em {formatCountdown(matchTime - (now ?? matchTime))}
                </span>
              )}
            </>
          )}
          {!isFinished && !notOpenYet && !isOpen && now !== null && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-500">
              Palpite encerrado
            </span>
          )}
          {prediction && (
            <span
              className={`rounded-full px-2 py-0.5 font-semibold ${
                prediction.confirmed
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {prediction.confirmed
                ? "Confirmado"
                : locked
                  ? "Confirmado automaticamente"
                  : "Rascunho"}
            </span>
          )}
          {prediction?.points !== null && prediction?.points !== undefined && (
            <span
              className={`rounded-full px-2 py-0.5 font-semibold ${
                prediction.points === 10
                  ? "bg-green-100 text-green-700"
                  : prediction.points === 5
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-zinc-100 text-zinc-500"
              }`}
            >
              +{prediction.points} pts
            </span>
          )}
        </div>

        {!locked && (
          <div className="flex items-center gap-2">
            {isDraft && (
              <button
                form={confirmFormId}
                type="submit"
                disabled={confirming}
                className="rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white active:bg-blue-700 disabled:opacity-60"
              >
                {confirming ? "Confirmando..." : "Confirmar"}
              </button>
            )}
            {!isConfirmed && (
              <button
                form={saveFormId}
                type="submit"
                disabled={pending}
                className="rounded-lg bg-green-600 px-3 py-1.5 font-semibold text-white active:bg-green-700 disabled:opacity-60"
              >
                {pending ? "Salvando..." : prediction ? "Atualizar" : "Salvar"}
              </button>
            )}
          </div>
        )}
      </div>

      {isConfirmed && (
        <p className="mt-2 text-xs text-blue-600">
          Palpite confirmado. Não é mais possível editar o placar.
        </p>
      )}
      {!locked && !isConfirmed && (
        <p className="mt-2 text-xs text-amber-600">
          Atenção: ao confirmar o palpite, ele não poderá mais ser editado.
        </p>
      )}
      {state?.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      {state?.success && <p className="mt-2 text-xs text-green-600">Palpite salvo!</p>}
      {confirmState?.error && <p className="mt-2 text-xs text-red-600">{confirmState.error}</p>}
      {confirmState?.success && (
        <p className="mt-2 text-xs text-green-600">Palpite confirmado!</p>
      )}

      {isAdmin && (
        <form
          id={adminFormId}
          action={adminAction}
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-zinc-200 pt-3 text-xs"
        >
          <input type="hidden" name="match_id" value={match.id} />
          <input type="hidden" name="status" value={resultFinished ? "finished" : "scheduled"} />
          <span className="font-semibold text-zinc-500">Resultado real:</span>
          <input
            type="number"
            name="home_score"
            min={0}
            max={99}
            required
            value={resultHome}
            onChange={(e) => setResultHome(e.target.value)}
            className="h-8 w-10 rounded-md border border-zinc-300 text-center text-sm font-bold"
            aria-label={`Resultado ${match.home_team}`}
          />
          <span className="text-zinc-400">x</span>
          <input
            type="number"
            name="away_score"
            min={0}
            max={99}
            required
            value={resultAway}
            onChange={(e) => setResultAway(e.target.value)}
            className="h-8 w-10 rounded-md border border-zinc-300 text-center text-sm font-bold"
            aria-label={`Resultado ${match.away_team}`}
          />
          <label className="flex items-center gap-1 font-medium text-zinc-500">
            <input
              type="checkbox"
              checked={resultFinished}
              onChange={(e) => setResultFinished(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Finalizado
          </label>
          <button
            type="submit"
            disabled={adminPending}
            className="ml-auto rounded-md bg-zinc-800 px-2 py-1 font-semibold text-white disabled:opacity-60"
          >
            {adminPending ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}
      {adminState?.error && <p className="mt-2 text-xs text-red-600">{adminState.error}</p>}
      {adminState?.success && <p className="mt-2 text-xs text-green-600">Resultado salvo!</p>}

      {isAdmin && (
        <form
          id={lateFormId}
          action={lateAction}
          className="mt-2 flex items-center gap-2 text-xs"
        >
          <input type="hidden" name="match_id" value={match.id} />
          <input type="hidden" name="allow_late_predictions" value={allowLate ? "on" : "off"} />
          <label className="flex items-center gap-1 font-medium text-zinc-500">
            <input
              type="checkbox"
              checked={allowLate}
              onChange={(e) => setAllowLate(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Liberar palpites (jogo em andamento)
          </label>
          <button
            type="submit"
            disabled={latePending}
            className="ml-auto rounded-md bg-zinc-800 px-2 py-1 font-semibold text-white disabled:opacity-60"
          >
            {latePending ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}
      {lateState?.error && <p className="mt-2 text-xs text-red-600">{lateState.error}</p>}
      {lateState?.success && <p className="mt-2 text-xs text-green-600">Configuração salva!</p>}
    </div>
  );
}
