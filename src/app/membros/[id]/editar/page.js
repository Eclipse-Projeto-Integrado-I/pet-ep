import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { atualizarMembro } from "../../actions"
import BotaoSalvar from "./botao-salvar"

export default async function EditarMembroPage({ params, searchParams }) {
  const { id } = await params
  const sp = await searchParams
  const erro = sp?.erro

  const supabase = await createClient()

  const { data: membro } = await supabase
    .from("perfis")
    .select("id, nome, email, curso, data_ingresso")
    .eq("id", id)
    .single()

  if (!membro) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-md mx-auto">
        <Link
          href="/membros"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para membros
        </Link>

        <h1 className="mt-4 font-bold text-3xl text-[#12192B]">Editar membro</h1>

        <form action={atualizarMembro} className="mt-8 space-y-5">
          <input type="hidden" name="id" value={membro.id} />

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Nome completo
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              defaultValue={membro.nome}
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
              defaultValue={membro.email}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
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
              defaultValue={membro.curso}
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
              defaultValue={membro.data_ingresso}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <BotaoSalvar />
        </form>
      </div>
    </div>
  )
}