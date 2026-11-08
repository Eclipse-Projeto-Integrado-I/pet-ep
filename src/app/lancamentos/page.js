import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { formatarData } from "@/lib/formatar-data"
import { limparBusca } from "@/lib/limpar-busca"
import { montarFiltroBusca } from "@/lib/busca-lancamentos"
import {
  lerPagina,
  intervaloDaPagina,
  totalDePaginas,
  montarUrl,
} from "@/lib/paginacao"
import { excluirLancamento } from "./actions"
import BotaoExcluir from "./botao-excluir"
import ControlesPaginacao from "./controles-paginacao"

const CAMINHO = "/lancamentos"

// Nem todo perfil tem "nome" preenchido (ex: usuários criados direto no painel),
// então usamos o e-mail como alternativa.
function nomeOuEmail(perfil) {
  return perfil?.nome || perfil?.email || "—"
}

export default async function LancamentosPage({ searchParams }) {
  const sp = await searchParams
  const erroAcao = sp?.erro
  const busca = limparBusca(sp?.busca)
  const paginaPedida = lerPagina(sp?.pagina)

  const supabase = await createClient()

  const { filtro, semResultados } = await montarFiltroBusca(supabase, busca)

  // Condições comuns à contagem e à listagem. Exclusão lógica: lançamentos
  // excluídos não aparecem nem contam.
  const aplicarFiltros = (query) => {
    let resultado = query.is("excluido_em", null)
    if (filtro) resultado = resultado.or(filtro)
    return resultado
  }

  // 1) Conta quantos lançamentos existem (head: true => só a contagem, sem linhas).
  let total = 0
  let erroContagem = null

  if (!semResultados) {
    const { count, error } = await aplicarFiltros(
      supabase.from("lancamentos").select("id", { count: "exact", head: true })
    )
    total = count ?? 0
    erroContagem = error
  }

  // 2) Se pediram uma página que não existe (URL editada à mão, ou a última
  // página ficou vazia depois de uma exclusão), levamos para a última válida.
  const totalPaginas = totalDePaginas(total)
  const pagina = Math.min(paginaPedida, totalPaginas)

  if (!erroContagem && pagina !== paginaPedida) {
    redirect(montarUrl(CAMINHO, { busca, pagina }))
  }

  // 3) Busca só as linhas da página atual.
  let lancamentos = []
  let erroLista = null

  if (!semResultados && total > 0) {
    const { de, ate } = intervaloDaPagina(pagina)

    // A tabela "lancamentos" tem VÁRIAS chaves estrangeiras para "perfis"
    // (membro_id, lancado_por, excluido_por). Por isso cada junção indica,
    // depois do "!", qual coluna usar.
    const { data, error } = await aplicarFiltros(
      supabase.from("lancamentos").select(
        `
        id,
        pontos,
        data_execucao,
        membro:perfis!membro_id ( nome, email ),
        atividade:atividades ( nome ),
        coordenador:perfis!lancado_por ( nome, email )
      `
      )
    )
      .order("data_execucao", { ascending: false })
      .order("created_at", { ascending: false })
      // Desempate OBRIGATÓRIO para paginar. Lançamentos em lote compartilham o
      // mesmo created_at; sem um critério único, a ordem entre eles pode mudar
      // de uma consulta para outra e itens se repetem ou somem entre páginas.
      .order("id", { ascending: false })
      .range(de, ate)

    lancamentos = data ?? []
    erroLista = error
  }

  const error = erroContagem || erroLista

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para o início
        </Link>

        <div className="flex items-center justify-between mt-4 mb-8">
          <div>
            <p className="text-sm text-[#8892A6]">PET-EP Gamifica</p>
            <h1 className="mt-1 font-bold text-3xl text-[#12192B]">Lançamentos</h1>
          </div>
                    <div className="flex items-center gap-5">
            <Link
              href="/lancamentos/excluidos"
              className="text-sm text-[#8892A6] underline underline-offset-2 hover:text-[#12192B]"
            >
              Ver excluídos
            </Link>
            <Link
              href="/lancamentos/novo"
              className="rounded-lg bg-[#12192B] text-white font-medium px-5 py-2.5 hover:bg-[#1c2740] transition-colors"
            >
              + Novo lançamento
            </Link>
          </div>
        </div>

        {/* Formulário GET nativo: ao enviar, a página recarrega com ?busca=...
            (sem "pagina", então toda nova busca começa na página 1). */}
        <form className="mb-6 flex items-center gap-4">
          <input
            type="text"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por membro ou atividade..."
            className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
          />
          {busca && (
            <Link
              href={CAMINHO}
              className="text-sm text-[#8892A6] underline underline-offset-2 hover:text-[#12192B]"
            >
              Limpar busca
            </Link>
          )}
        </form>

        {/* Mostramos os erros em vez de uma lista vazia silenciosa. */}
        {error && (
          <p className="mb-6 text-sm text-red-600">
            Erro ao carregar os lançamentos: {error.message}
          </p>
        )}
        {erroAcao && <p className="mb-6 text-sm text-red-600">{erroAcao}</p>}

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-[#8892A6]">
              <tr>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Membro</th>
                <th className="px-5 py-3 font-medium">Atividade</th>
                <th className="px-5 py-3 font-medium">Pontos</th>
                <th className="px-5 py-3 font-medium">Lançado por</th>
                <th className="px-5 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lancamentos.map((lancamento) => (
                <tr key={lancamento.id}>
                  <td className="px-5 py-3 text-[#8892A6]">
                    {formatarData(lancamento.data_execucao)}
                  </td>
                  <td className="px-5 py-3 text-[#12192B]">
                    {nomeOuEmail(lancamento.membro)}
                  </td>
                  <td className="px-5 py-3 text-[#12192B]">
                    {lancamento.atividade?.nome ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-[#E8A33D]/15 text-[#B5791F] text-xs font-medium px-2.5 py-1">
                      {lancamento.pontos} pts
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#8892A6]">
                    {nomeOuEmail(lancamento.coordenador)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/lancamentos/${lancamento.id}/editar`}
                        className="text-sm text-[#12192B] underline underline-offset-2 hover:text-[#E8A33D]"
                      >
                        Editar
                      </Link>
                      <form action={excluirLancamento}>
                        <input type="hidden" name="id" value={lancamento.id} />
                        <BotaoExcluir />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {lancamentos.length === 0 && !error && (
            <p className="text-center text-[#8892A6] py-10">
              {busca
                ? `Nenhum lançamento encontrado para "${busca}".`
                : "Nenhum lançamento registrado ainda."}
            </p>
          )}
        </div>

        <ControlesPaginacao
          caminho={CAMINHO}
          pagina={pagina}
          totalPaginas={totalPaginas}
          total={total}
          busca={busca}
        />
      </div>
    </div>
  )
}