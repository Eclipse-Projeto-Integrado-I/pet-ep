import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { atualizarAtividade } from "../../actions"
import BotaoSalvar from "./botao-salvar"

export default async function EditarAtividadePage({ params, searchParams }) {
  const { id } = await params
  const sp = await searchParams
  const erro = sp?.erro

  const supabase = await createClient()

  const { data: atividade } = await supabase
    .from("atividades")
    .select("id, nome, descricao, foto_url, pontuacao")
    .eq("id", id)
    .single()

  if (!atividade) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-md mx-auto">
        <Link
          href="/atividades"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para atividades
        </Link>

        <h1 className="mt-4 font-bold text-3xl text-[#12192B]">Editar atividade</h1>

        {atividade.foto_url && (
          <img
            src={atividade.foto_url}
            alt={atividade.nome}
            className="mt-4 w-full aspect-video object-cover rounded-lg"
          />
        )}

        <form action={atualizarAtividade} className="mt-8 space-y-5">
          <input type="hidden" name="id" value={atividade.id} />

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Nome da atividade
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              defaultValue={atividade.nome}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
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
              defaultValue={atividade.descricao || ""}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
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
              defaultValue={atividade.pontuacao}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="foto" className="block text-sm font-medium text-[#12192B] mb-1.5">
              Trocar foto (opcional)
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

          <BotaoSalvar />
        </form>
      </div>
    </div>
  )
}