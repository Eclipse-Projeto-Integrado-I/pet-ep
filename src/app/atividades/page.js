import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { alternarStatusAtividade } from "./actions"

// Server Component: busca os dados direto no servidor a cada requisição.
// O RLS da tabela "atividades" só retorna linhas para coordenadores ativos,
// então um membro comum receberia uma lista vazia mesmo acessando a URL.
export default async function AtividadesPage() {
  const supabase = await createClient()

  const { data: atividades } = await supabase
    .from("atividades")
    .select("id, nome, descricao, foto_url, pontuacao, status")
    .order("nome", { ascending: true })

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
            <h1 className="mt-1 font-bold text-3xl text-[#12192B]">Atividades</h1>
          </div>
          <Link
            href="/atividades/novo"
            className="rounded-lg bg-[#12192B] text-white font-medium px-5 py-2.5 hover:bg-[#1c2740] transition-colors"
          >
            + Nova atividade
          </Link>
        </div>

        {/* Grade de cards: aproveita a foto como identificação visual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {atividades?.map((atividade) => (
            <div
              key={atividade.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Foto da atividade, ou um aviso quando não foi cadastrada */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {atividade.foto_url ? (
                  <img
                    src={atividade.foto_url}
                    alt={atividade.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-[#8892A6]">Sem foto</span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-medium text-[#12192B]">{atividade.nome}</h2>
                  <span className="shrink-0 rounded-full bg-[#E8A33D]/15 text-[#B5791F] text-xs font-medium px-2.5 py-1">
                    {atividade.pontuacao} pts
                  </span>
                </div>

                {atividade.descricao && (
                  <p className="mt-2 text-sm text-[#8892A6] line-clamp-2">
                    {atividade.descricao}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href={`/atividades/${atividade.id}/editar`}
                    className="text-sm text-[#12192B] underline underline-offset-2 hover:text-[#E8A33D]"
                  >
                    Editar
                  </Link>

                  <div className="flex items-center gap-3">
                    {/* Badge visual do status atual */}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        atividade.status === "ativo"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          atividade.status === "ativo" ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      {atividade.status}
                    </span>

                    {/* Os campos hidden levam o id e o status atual para a
                        Server Action, que decide o novo status */}
                    <form action={alternarStatusAtividade}>
                      <input type="hidden" name="id" value={atividade.id} />
                      <input type="hidden" name="statusAtual" value={atividade.status} />
                      <button
                        type="submit"
                        className="text-sm text-[#8892A6] underline underline-offset-2 hover:text-[#12192B]"
                      >
                        {atividade.status === "ativo" ? "Inativar" : "Reativar"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {atividades?.length === 0 && (
          <p className="text-center text-[#8892A6] py-10">
            Nenhuma atividade cadastrada ainda.
          </p>
        )}
      </div>
    </div>
  )
}