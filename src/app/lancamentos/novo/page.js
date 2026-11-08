import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { cadastrarLancamentos } from "./actions"
import SeletorMembros from "./seletor-membros"
import BotaoCadastrar from "./botao-cadastrar"

export default async function NovoLancamentoPage({ searchParams }) {
  const sp = await searchParams
  const erro = sp?.erro

  const supabase = await createClient()

  // Só membros ativos e atividades ativas podem receber/gerar lançamentos.
  // É aqui que a inativação construída nas fases anteriores passa a ter efeito.
  const [{ data: membros }, { data: atividades }] = await Promise.all([
    supabase
      .from("perfis")
      .select("id, nome, email")
      .eq("papel", "membro")
      .eq("status", "ativo")
      .order("nome", { ascending: true }),
    supabase
      .from("atividades")
      .select("id, nome, pontuacao")
      .eq("status", "ativo")
      .order("nome", { ascending: true }),
  ])

  const hoje = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Fortaleza",
  })

  const semDados = !membros?.length || !atividades?.length

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-md mx-auto">
        <Link
          href="/lancamentos"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para lançamentos
        </Link>

        <h1 className="mt-4 font-bold text-3xl text-[#12192B]">Novo lançamento</h1>
        <p className="mt-2 text-[#8892A6]">
          Selecione um membro para um lançamento individual, ou vários para uma
          atividade em grupo.
        </p>

        {semDados ? (
          <p className="mt-8 text-[#8892A6]">
            É necessário ter ao menos um membro ativo e uma atividade ativa
            cadastrados para registrar pontuação.
          </p>
        ) : (
          <form action={cadastrarLancamentos} className="mt-8 space-y-5">
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
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {atividades.map((atividade) => (
                  <option key={atividade.id} value={atividade.id}>
                    {atividade.nome} — {atividade.pontuacao} pts
                  </option>
                ))}
              </select>
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
                defaultValue={hoje}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
              />
            </div>

            <SeletorMembros membros={membros} />

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <BotaoCadastrar />
          </form>
        )}
      </div>
    </div>
  )
}