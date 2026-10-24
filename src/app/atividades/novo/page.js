"use client"

import { useSearchParams } from "next/navigation"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { cadastrarAtividade } from "./actions"

function BotaoCadastrar() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-[#12192B] text-white font-medium py-2.5 hover:bg-[#1c2740] transition-colors disabled:opacity-60"
    >
      {pending ? "Cadastrando..." : "Cadastrar atividade"}
    </button>
  )
}

export default function NovaAtividadePage() {
  const searchParams = useSearchParams()
  const erro = searchParams.get("erro")

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-md mx-auto">
        <Link
          href="/atividades"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para atividades
        </Link>

        <h1 className="mt-4 font-bold text-3xl text-[#12192B]">
          Nova atividade
        </h1>

        <form action={cadastrarAtividade} className="mt-8 space-y-5">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Nome da atividade
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              placeholder="Ex: Artigo científico publicado"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={3}
              placeholder="Opcional"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="pontuacao" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Pontuação
            </label>
            <input
              id="pontuacao"
              name="pontuacao"
              type="number"
              min="0"
              step="1"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="foto" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Foto (opcional)
            </label>
            <input
              id="foto"
              name="foto"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-[#12192B] file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#12192B] hover:file:bg-gray-200"
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <BotaoCadastrar />
        </form>
      </div>
    </div>
  )
}