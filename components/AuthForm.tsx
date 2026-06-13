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
        <div className="flex gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="first_name" className="text-sm font-medium text-zinc-700">
              Nome
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              minLength={2}
              placeholder="Seu nome"
              className="rounded-lg border border-zinc-300 px-4 py-3 text-base uppercase focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="last_name" className="text-sm font-medium text-zinc-700">
              Sobrenome
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              minLength={2}
              placeholder="Seu sobrenome"
              className="rounded-lg border border-zinc-300 px-4 py-3 text-base uppercase focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium text-zinc-700">
          Nome de usuário
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
          placeholder="Seu nome de usuário"
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
