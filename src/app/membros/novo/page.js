"use client"

import { useSearchParams } from "next/navigation"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { cadastrarMembro } from "./actions"

function BotaoCadastrar() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-[#12192B] text-white font-medium py-2.5 hover:bg-[#1c2740] transition-colors disabled:opacity-60"
    >
      {pending ? "Cadastrando..." : "Cadastrar membro"}
    </button>
  )
}

export default function NovoMembroPage() {
  const searchParams = useSearchParams()
  const erro = searchParams.get("erro")

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-md mx-auto">
        <Link
          href="/membros"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para membros
        </Link>

        <h1 className="mt-4 font-bold text-3xl text-[#12192B]">
          Novo membro
        </h1>
        <p className="mt-2 text-[#8892A6]">
          O membro poderá alterar a senha depois do primeiro acesso.
        </p>

        <form action={cadastrarMembro} className="mt-8 space-y-5">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Nome completo
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            />
          </div>

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
            <label htmlFor="curso" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Curso
            </label>
            <select
              id="curso"
              name="curso"
              required
              defaultValue="Engenharia de Produção"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            >
              <option value="Engenharia de Produção">Engenharia de Produção</option>
            </select>
          </div>

          <div>
            <label htmlFor="dataIngresso" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Data de ingresso no PET
            </label>
            <input
              id="dataIngresso"
              name="dataIngresso"
              type="date"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Senha provisória
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <BotaoCadastrar />
        </form>
      </div>
    </div>
  )
}