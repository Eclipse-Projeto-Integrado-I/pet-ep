"use client"

import { useSearchParams } from "next/navigation"
import { useFormStatus } from "react-dom"
import { Space_Grotesk, Inter } from "next/font/google"
import { login } from "./actions"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
})

const previewRanking = [
  { posicao: "1º", nome: "Ana Lima", pontos: 480 },
  { posicao: "2º", nome: "João Souza", pontos: 420 },
  { posicao: "3º", nome: "Beatriz Melo", pontos: 390 },
]

function BotaoEntrar() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-[#12192B] text-white font-medium py-2.5 hover:bg-[#1c2740] transition-colors disabled:opacity-60"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  )
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const erro = searchParams.get("erro")

  return (
    <div
      className={`${spaceGrotesk.variable} ${inter.variable} min-h-screen grid grid-cols-1 md:grid-cols-2 font-[family-name:var(--font-body)]`}
    >
      {/* Painel institucional */}
      <div className="hidden md:flex flex-col justify-between bg-[#12192B] text-white px-14 py-16">
        <div>
          <p className="text-sm text-[#8892A6]">PET Engenharia de Produção — UFC</p>
          <h1 className="mt-6 font-[family-name:var(--font-display)] font-bold text-5xl leading-tight">
            PET-EP
            <br />
            Gamifica
          </h1>
          <p className="mt-6 text-[#8892A6] max-w-sm leading-relaxed">
            Cada artigo, visita técnica e evento organizado vira ponto. Acompanhe seu progresso e veja onde você está no ranking do semestre.
          </p>
        </div>

        <div className="max-w-sm">
          <p className="text-sm text-[#8892A6] mb-4">Ranking do semestre atual</p>
          <div className="space-y-3">
            {previewRanking.map((item) => (
              <div
                key={item.posicao}
                className="flex items-center justify-between border-b border-white/10 pb-3"
              >
                <div className="flex items-center gap-4">
                  <span className="font-[family-name:var(--font-display)] font-bold text-[#E8A33D]">
                    {item.posicao}
                  </span>
                  <span>{item.nome}</span>
                </div>
                <span className="text-[#8892A6]">{item.pontos} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel de login */}
      <div className="flex items-center justify-center px-8 py-16 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-3xl text-[#12192B]">
            Entrar
          </h2>
          <p className="mt-2 text-[#8892A6]">
            Use seu e-mail institucional da UFC.
          </p>

          <form action={login} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#12192B] mb-1.5">
                E-mail institucional
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nome@aluno.ufc.br"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-[#12192B] mb-1.5">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
              />
            </div>

            {erro && (
              <p className="text-sm text-red-600">{erro}</p>
            )}

            <BotaoEntrar />
          </form>
        </div>
      </div>
    </div>
  )
}