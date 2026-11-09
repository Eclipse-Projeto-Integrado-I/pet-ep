import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { formatarData } from "@/lib/formatar-data"
import AtualizarRanking from "./atualizar-ranking"

// Painel de Líderes: ranking dos membros ativos no semestre.
// Visível para qualquer usuário logado (membros e coordenadores).
export default async function RankingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // "Hoje" no fuso de Fortaleza (AAAA-MM-DD).
  const hoje = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Fortaleza",
  })

  // Semestre em andamento e, como alternativa, o último encerrado. As duas
  // consultas rodam juntas para o painel carregar rápido (RNF03).
  const [{ data: atual }, { data: ultimoEncerrado }] = await Promise.all([
    supabase
      .from("semestres")
      .select("nome, data_inicio, data_fim")
      .lte("data_inicio", hoje)
      .gte("data_fim", hoje)
      .maybeSingle(),
    supabase
      .from("semestres")
      .select("nome, data_inicio, data_fim")
      .lt("data_fim", hoje)
      .order("data_fim", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Entre semestres (ex: férias), mantém visível o último que terminou, para
  // os vencedores continuarem aparecendo.
  const semestre = atual ?? ultimoEncerrado
  const encerrado = !atual && Boolean(ultimoEncerrado)

  let ranking = []
  let erro = null

  if (semestre) {
    // A função roda no banco com privilégios elevados e devolve só nome,
    // pontos e quantidade de lançamentos, já ordenados (RN03 incluída).
    const { data, error } = await supabase.rpc("ranking_periodo", {
      p_inicio: semestre.data_inicio,
      p_fim: semestre.data_fim,
    })
    ranking = data ?? []
    erro = error
  }

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para o início
        </Link>

        <div className="mt-4 mb-8">
          <p className="text-sm text-[#8892A6]">PET-EP Gamifica</p>
          <h1 className="mt-1 font-bold text-3xl text-[#12192B]">
            Painel de Líderes
          </h1>

          {semestre && (
            <>
              <p className="mt-2 text-[#8892A6]">
                Semestre {semestre.nome}, de {formatarData(semestre.data_inicio)}{" "}
                a {formatarData(semestre.data_fim)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    encerrado
                      ? "bg-gray-100 text-gray-500"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {encerrado ? "Semestre encerrado" : "Em andamento"}
                </span>
                <AtualizarRanking />
              </div>
            </>
          )}
        </div>

        {erro && (
          <p className="mb-6 text-sm text-red-600">
            Erro ao carregar o ranking: {erro.message}
          </p>
        )}

        {!semestre && !erro && (
          <p className="text-[#8892A6] py-10">
            Ainda não há um semestre cadastrado para exibir o ranking. Peça a um
            coordenador para cadastrá-lo.
          </p>
        )}

        {semestre && !erro && ranking.length === 0 && (
          <p className="text-[#8892A6] py-10">
            Nenhum membro ativo para exibir no ranking.
          </p>
        )}

        {ranking.length > 0 && (
          <ol className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
            {ranking.map((item, indice) => (
              <li
                key={`${item.posicao}-${indice}`}
                className={`flex items-center gap-4 px-5 py-4 ${
                  item.eh_voce ? "bg-[#E8A33D]/10" : ""
                }`}
              >
                {/* Empates compartilham a posição (ex: dois "2º"). */}
                <span
                  className={`w-10 shrink-0 font-bold text-lg ${
                    item.posicao <= 3 ? "text-[#B5791F]" : "text-[#8892A6]"
                  }`}
                >
                  {item.posicao}º
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#12192B]">
                    {item.nome}
                    {item.eh_voce && (
                      <span className="ml-2 text-xs font-medium text-[#B5791F]">
                        você
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-[#8892A6]">
                    {item.total_lancamentos}{" "}
                    {item.total_lancamentos === 1 ? "lançamento" : "lançamentos"}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-[#E8A33D]/15 text-[#B5791F] text-sm font-medium px-3 py-1">
                  {item.pontos} pts
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}