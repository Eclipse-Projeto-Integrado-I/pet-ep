import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { formatarData } from "@/lib/formatar-data"
import {
  lerPagina,
  intervaloDaPagina,
  totalDePaginas,
  montarUrl,
} from "@/lib/paginacao"
// Componente compartilhado com as telas de lançamentos.
import ControlesPaginacao from "@/app/lancamentos/controles-paginacao"

const CAMINHO = "/extrato"

// Extrato individual: o membro vê o histórico dos PRÓPRIOS pontos.
//
// Segurança em duas camadas:
// 1) RLS: o membro só consegue ler lançamentos com membro_id = auth.uid() e
//    não excluídos (policy "membros_veem_proprios_lancamentos").
// 2) Filtros explícitos aqui. O RLS sozinho NÃO basta: o coordenador enxerga
//    todas as linhas, então sem o .eq("membro_id", user.id) um coordenador
//    veria os lançamentos de todo mundo. Por isso eles também são redirecionados.
export default async function ExtratoPage({ searchParams }) {
  const sp = await searchParams
  const paginaPedida = lerPagina(sp?.pagina)

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, email, papel")
    .eq("id", user.id)
    .single()

  // Coordenadores não têm pontuação: o extrato existe só para membros.
  if (perfil?.papel !== "membro") {
    redirect("/")
  }

  // 1) Todos os pontos válidos do membro: dá o total de lançamentos
  // (todos.length) e o total geral de pontos, de uma vez.
  // Obs.: o Supabase devolve no máximo 1000 linhas por consulta. Muito acima
  // do volume esperado para um membro, mas se isso um dia for um problema, a
  // soma deve passar para uma função ou view no banco.
  const { data: todos, error: erroResumo } = await supabase
    .from("lancamentos")
    .select("pontos")
    .eq("membro_id", user.id)
    .is("excluido_em", null)

  const total = todos?.length ?? 0
  const totalPontos = (todos ?? []).reduce((soma, l) => soma + l.pontos, 0)

  // 2) Página inexistente (URL editada à mão, ou lançamento excluído que
  // esvaziou a última página) => leva para a última válida.
  const totalPaginas = totalDePaginas(total)
  const pagina = Math.min(paginaPedida, totalPaginas)

  if (!erroResumo && pagina !== paginaPedida) {
    redirect(montarUrl(CAMINHO, { pagina }))
  }

  // 3) Só as linhas da página atual.
  let lancamentos = []
  let erroLista = null

  if (total > 0) {
    const { de, ate } = intervaloDaPagina(pagina)

    const { data, error } = await supabase
      .from("lancamentos")
      .select("id, pontos, data_execucao, atividade:atividades ( nome )")
      .eq("membro_id", user.id)
      .is("excluido_em", null)
      .order("data_execucao", { ascending: false })
      .order("created_at", { ascending: false })
      // Desempate obrigatório para a paginação (lançamentos em lote
      // compartilham o mesmo created_at).
      .order("id", { ascending: false })
      .range(de, ate)

    lancamentos = data ?? []
    erroLista = error
  }

  const error = erroResumo || erroLista

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para o início
        </Link>

        <div className="mt-4 mb-8">
          <p className="text-sm text-[#8892A6]">PET-EP Gamifica</p>
          <h1 className="mt-1 font-bold text-3xl text-[#12192B]">Meu extrato</h1>
          <p className="mt-2 text-[#8892A6]">{perfil.nome || perfil.email}</p>
        </div>

        {error && (
          <p className="mb-6 text-sm text-red-600">
            Erro ao carregar o extrato: {error.message}
          </p>
        )}

        {/* "Total geral": soma de todos os lançamentos válidos. O total por
            semestre virá com as configurações de semestre. */}
        <div className="mb-8 rounded-xl border border-gray-200 px-6 py-5">
          <p className="text-sm text-[#8892A6]">Total geral</p>
          <p className="mt-1 font-bold text-4xl text-[#12192B]">
            {totalPontos}{" "}
            <span className="text-base font-medium text-[#8892A6]">pts</span>
          </p>
          <p className="mt-1 text-sm text-[#8892A6]">
            {total} {total === 1 ? "lançamento" : "lançamentos"}
          </p>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-[#8892A6]">
              <tr>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Atividade</th>
                <th className="px-5 py-3 font-medium">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lancamentos.map((lancamento) => (
                <tr key={lancamento.id}>
                  <td className="px-5 py-3 text-[#8892A6]">
                    {formatarData(lancamento.data_execucao)}
                  </td>
                  <td className="px-5 py-3 text-[#12192B]">
                    {lancamento.atividade?.nome ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-[#E8A33D]/15 text-[#B5791F] text-xs font-medium px-2.5 py-1">
                      {lancamento.pontos} pts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {total === 0 && !error && (
            <p className="text-center text-[#8892A6] py-10 px-6">
              Você ainda não tem pontos lançados. Quando um coordenador registrar
              sua participação em uma atividade, ela aparecerá aqui.
            </p>
          )}
        </div>

        <ControlesPaginacao
          caminho={CAMINHO}
          pagina={pagina}
          totalPaginas={totalPaginas}
          total={total}
        />
      </div>
    </div>
  )
}