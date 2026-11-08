import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { atualizarLancamento } from "../../actions"
import BotaoSalvar from "./botao-salvar"

export default async function EditarLancamentoPage({ params, searchParams }) {
  const { id } = await params
  const sp = await searchParams
  const erro = sp?.erro

  const supabase = await createClient()

  // Lançamentos excluídos não são editáveis: caem no 404.
  const { data: lancamento } = await supabase
    .from("lancamentos")
    .select("id, membro_id, atividade_id, pontos, data_execucao")
    .eq("id", id)
    .is("excluido_em", null)
    .single()

  if (!lancamento) {
    notFound()
  }

  // As listas trazem os ativos MAIS o membro/atividade atuais do lançamento,
  // mesmo que hoje estejam inativos. Assim dá para corrigir só a data de um
  // lançamento antigo sem ser forçado a trocar o membro ou a atividade.
  const [{ data: membros }, { data: atividades }] = await Promise.all([
    supabase
      .from("perfis")
      .select("id, nome, email, status")
      .or(`and(papel.eq.membro,status.eq.ativo),id.eq.${lancamento.membro_id}`)
      .order("nome", { ascending: true }),
    supabase
      .from("atividades")
      .select("id, nome, pontuacao, status")
      .or(`status.eq.ativo,id.eq.${lancamento.atividade_id}`)
      .order("nome", { ascending: true }),
  ])

  const hoje = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Fortaleza",
  })

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-md mx-auto">
        <Link
          href="/lancamentos"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para lançamentos
        </Link>

        <h1 className="mt-4 font-bold text-3xl text-[#12192B]">Editar lançamento</h1>

        <form action={atualizarLancamento} className="mt-8 space-y-5">
          <input type="hidden" name="id" value={lancamento.id} />

          <div>
            <label
              htmlFor="membro"
              className="block text-sm font-medium text-[#12192B] mb-1.5"
            >
              Membro
            </label>
            <select
              id="membro"
              name="membro"
              required
              defaultValue={lancamento.membro_id}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            >
              {membros?.map((membro) => (
                <option key={membro.id} value={membro.id}>
                  {membro.nome || membro.email}
                  {membro.status === "inativo" ? " (inativo)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="atividade"
              className="block text-sm font-medium text-[#12192B] mb-1.5"
            >
              Atividade realizada
            </label>
            <select
              id="atividade"
              name="atividade"
              required
              defaultValue={lancamento.atividade_id}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
            >
              {atividades?.map((atividade) => (
                <option key={atividade.id} value={atividade.id}>
                  {atividade.nome} — {atividade.pontuacao} pts
                  {atividade.status === "inativo" ? " (inativa)" : ""}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-sm text-[#8892A6]">
              Pontos atuais deste lançamento: {lancamento.pontos}. Eles só são
              recalculados se você trocar a atividade.
            </p>
          </div>

          <div>
            <label
              htmlFor="dataExecucao"
              className="block text-sm font-medium text-[#12192B] mb-1.5"
            >
              Data de execução
            </label>
            <input
              id="dataExecucao"
              name="dataExecucao"
              type="date"
              required
              max={hoje}
              defaultValue={lancamento.data_execucao}
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