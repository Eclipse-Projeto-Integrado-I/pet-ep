import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { formatarData, formatarDataHora } from "@/lib/formatar-data"
import { limparBusca } from "@/lib/limpar-busca"
import { montarFiltroBusca } from "@/lib/busca-lancamentos"
import {
  lerPagina,
  intervaloDaPagina,
  totalDePaginas,
  montarUrl,
} from "@/lib/paginacao"
import ControlesPaginacao from "../controles-paginacao"

const CAMINHO = "/lancamentos/excluidos"

// Nem todo perfil tem "nome" preenchido, então usamos o e-mail como alternativa.
function nomeOuEmail(perfil) {
  return perfil?.nome || perfil?.email || "—"
}

// Tela SOMENTE DE CONSULTA: mostra os lançamentos que passaram por exclusão
// lógica (linha mantida no banco, com "excluido_em" e "excluido_por"
// preenchidos). Eles NÃO contam pontos. A restauração ainda não existe.
export default async function LancamentosExcluidosPage({ searchParams }) {
  const sp = await searchParams
  const busca = limparBusca(sp?.busca)
  const paginaPedida = lerPagina(sp?.pagina)

  const supabase = await createClient()

  const { filtro, semResultados } = await montarFiltroBusca(supabase, busca)

  // Inverso da tela principal: aqui queremos só os que TÊM data de exclusão.
  const aplicarFiltros = (query) => {
    let resultado = query.not("excluido_em", "is", null)
    if (filtro) resultado = resultado.or(filtro)
    return resultado
  }

  // 1) Conta o total para calcular as páginas.
  let total = 0
  let erroContagem = null

  if (!semResultados) {
    const { count, error } = await aplicarFiltros(
      supabase.from("lancamentos").select("id", { count: "exact", head: true })
    )
    total = count ?? 0
    erroContagem = error
  }

  // 2) Página inexistente => leva para a última válida.
  const totalPaginas = totalDePaginas(total)
  const pagina = Math.min(paginaPedida, totalPaginas)

  if (!erroContagem && pagina !== paginaPedida) {
    redirect(montarUrl(CAMINHO, { busca, pagina }))
  }

  // 3) Busca as linhas da página atual.
  let lancamentos = []
  let erroLista = null

  if (!semResultados && total > 0) {
    const { de, ate } = intervaloDaPagina(pagina)

    // Três chaves estrangeiras apontam para "perfis"; o "!" indica qual usar.
    const { data, error } = await aplicarFiltros(
      supabase.from("lancamentos").select(
        `
        id,
        pontos,
        data_execucao,
        excluido_em,
        membro:perfis!membro_id ( nome, email ),
        atividade:atividades ( nome ),
        excluidor:perfis!excluido_por ( nome, email )
      `
      )
    )
      // Mais recentemente excluídos primeiro; "id" desempata para a
      // paginação não repetir nem perder itens.
      .order("excluido_em", { ascending: false })
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
          href="/lancamentos"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para lançamentos
        </Link>

        <div className="mt-4 mb-8">
          <p className="text-sm text-[#8892A6]">PET-EP Gamifica</p>
          <h1 className="mt-1 font-bold text-3xl text-[#12192B]">
            Lançamentos excluídos
          </h1>
          <p className="mt-2 text-[#8892A6]">
            Estes lançamentos não contam pontos. Ficam aqui apenas para consulta
            e auditoria.
          </p>
        </div>

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

        {error && (
          <p className="mb-6 text-sm text-red-600">
            Erro ao carregar os lançamentos excluídos: {error.message}
          </p>
        )}

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-[#8892A6]">
              <tr>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Membro</th>
                <th className="px-5 py-3 font-medium">Atividade</th>
                <th className="px-5 py-3 font-medium">Pontos</th>
                <th className="px-5 py-3 font-medium">Excluído por</th>
                <th className="px-5 py-3 font-medium">Excluído em</th>
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
                    {/* Cinza e riscado: deixa claro que estes pontos não valem. */}
                    <span className="rounded-full bg-gray-100 text-gray-500 line-through text-xs font-medium px-2.5 py-1">
                      {lancamento.pontos} pts
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#8892A6]">
                    {nomeOuEmail(lancamento.excluidor)}
                  </td>
                  <td className="px-5 py-3 text-[#8892A6]">
                    {formatarDataHora(lancamento.excluido_em)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {lancamentos.length === 0 && !error && (
            <p className="text-center text-[#8892A6] py-10">
              {busca
                ? `Nenhum lançamento excluído encontrado para "${busca}".`
                : "Nenhum lançamento foi excluído até agora."}
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