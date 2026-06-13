import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">⚽ Bolão Copa 2026</h1>
          <p className="mt-2 text-sm text-zinc-500">Entre na sua conta para dar seus palpites</p>
        </div>

        <AuthForm mode="login" action={login} />

        <p className="mt-6 text-center text-sm text-zinc-500">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-green-600">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
