"use client";

import { useActionState } from "react";
import type { AuthState } from "@/lib/actions/auth";

type Props = {
  mode: "login" | "cadastro";
  action: (prevState: AuthState, formData: FormData) => Promise<AuthState>;
};

export default function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null
  );

  const isCadastro = mode === "cadastro";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isCadastro && (
        <div className="flex flex-col gap-1">
          <label htmlFor="display_name" className="text-sm font-medium text-zinc-700">
            Nome de exibição
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            minLength={2}
            placeholder="Como vão te chamar no ranking"
            className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium text-zinc-700">
          Nickname
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          autoComplete="username"
          placeholder="seu_nickname"
          className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
        />
        {isCadastro && (
          <p className="text-xs text-zinc-400">
            Usado para entrar na conta. Apenas letras, números e _.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isCadastro ? "new-password" : "current-password"}
          placeholder="••••••••"
          className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-green-600 px-4 py-3 text-base font-semibold text-white transition-colors active:bg-green-700 disabled:opacity-60"
      >
        {pending
          ? "Aguarde..."
          : isCadastro
            ? "Criar conta"
            : "Entrar"}
      </button>
    </form>
  );
}
