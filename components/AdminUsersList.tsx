"use client";

import { useActionState, useState } from "react";
import { updateUserAccount, deleteUserAccount, type AdminState } from "@/lib/actions/admin";

export type AdminUserRow = {
  id: string;
  username: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
};

type Props = {
  users: AdminUserRow[];
  currentUserId?: string;
};

export default function AdminUsersList({ users, currentUserId }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <UserRow key={user.id} user={user} isSelf={user.id === currentUserId} />
      ))}
    </div>
  );
}

function UserRow({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    updateUserAccount,
    null
  );
  const [deleteState, deleteAction, deletePending] = useActionState<AdminState, FormData>(
    deleteUserAccount,
    null
  );
  const [passwordUnlocked, setPasswordUnlocked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const createdAt = new Date(user.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 text-left"
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-xs text-zinc-500 transition-transform ${
            expanded ? "rotate-45" : ""
          }`}
        >
          +
        </span>
        <span className="flex-1">
          <span className="font-medium text-zinc-900">{user.display_name}</span>
          <span className="ml-1.5 text-sm text-zinc-500">@{user.username}</span>
        </span>
        {user.is_admin && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            admin
          </span>
        )}
      </button>

      {expanded && (
        <>
          <p className="mt-2 text-xs text-zinc-400">Cadastrado em {createdAt}</p>

          <form
            action={formAction}
            onSubmit={(e) => {
              if (!confirm(`Confirma salvar as alterações do usuário "${user.username}"?`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="user_id" value={user.id} />

            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Nome de exibição
                <input
                  type="text"
                  name="display_name"
                  defaultValue={user.display_name}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Nick
                <input
                  type="text"
                  name="username"
                  defaultValue={user.username}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Senha
                <div className="flex gap-2">
                  <input
                    key={passwordUnlocked ? "unlocked" : "locked"}
                    type="password"
                    name={passwordUnlocked ? "password" : undefined}
                    placeholder={passwordUnlocked ? "Digite a nova senha" : undefined}
                    value={passwordUnlocked ? undefined : "••••••••"}
                    defaultValue={passwordUnlocked ? "" : undefined}
                    minLength={6}
                    readOnly={!passwordUnlocked}
                    disabled={!passwordUnlocked}
                    className={`flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm ${
                      passwordUnlocked ? "text-zinc-900" : "bg-zinc-50 text-zinc-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordUnlocked((v) => !v)}
                    aria-label={passwordUnlocked ? "Cancelar alteração de senha" : "Editar senha"}
                    className="flex w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-500"
                  >
                    {passwordUnlocked ? (
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>
            </div>

            {state?.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
            {state?.success && <p className="mt-2 text-xs text-green-600">Salvo com sucesso.</p>}

            <button
              type="submit"
              disabled={pending}
              className="mt-3 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Salvando..." : "Salvar"}
            </button>
          </form>

          {!isSelf && (
            <form
              action={deleteAction}
              onSubmit={(e) => {
                if (
                  !confirm(
                    `Tem certeza que deseja EXCLUIR o usuário "${user.username}"? Isso vai remover a conta e todos os palpites dele. Essa ação não pode ser desfeita.`
                  )
                ) {
                  e.preventDefault();
                }
              }}
              className="mt-2"
            >
              <input type="hidden" name="user_id" value={user.id} />

              {deleteState?.error && (
                <p className="mb-2 text-xs text-red-600">{deleteState.error}</p>
              )}

              <button
                type="submit"
                disabled={deletePending}
                className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-60"
              >
                {deletePending ? "Excluindo..." : "Excluir usuário"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
