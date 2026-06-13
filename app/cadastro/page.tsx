import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { signup } from "@/lib/actions/auth";

export default function CadastroPage() {
  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/worldcup-2026-logo.svg"
            alt="Copa do Mundo FIFA 2026"
            width={160}
            height={172}
            className="mb-3 h-40 w-auto"
            priority
          />
          <h1 className="text-2xl font-bold text-brand-navy">Bolão Copa 2026</h1>
          <p className="mt-2 text-sm text-zinc-500">Crie sua conta e comece a palpitar</p>
        </div>

        <AuthForm mode="cadastro" action={signup} />

        <p className="mt-6 text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-green-600">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
