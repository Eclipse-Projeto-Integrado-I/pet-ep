"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Registra pontuação para UM ou VÁRIOS membros de uma vez.
// Um membro selecionado = lançamento individual; vários = lançamento em lote.
// O INSERT é feito num único comando, então o lote é "tudo ou nada":
// se uma linha falhar, nenhuma é gravada.
export async function cadastrarLancamentos(formData) {
  // getAll devolve todos os checkboxes marcados. O Set remove duplicados.
  const membrosIds = [...new Set(formData.getAll("membros"))]
  const atividadeId = formData.get("atividade")
  const dataExecucao = formData.get("dataExecucao")

  const voltarComErro = (mensagem) =>
    redirect(`/lancamentos/novo?erro=${encodeURIComponent(mensagem)}`)

  if (membrosIds.length === 0) {
    voltarComErro("Selecione ao menos um membro.")
  }

  // Data de hoje no fuso de Fortaleza (formato AAAA-MM-DD). Não usamos
  // toISOString() porque ele devolve a data em UTC e, à noite, já seria "amanhã".
  const hoje = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Fortaleza",
  })

  if (!dataExecucao || dataExecucao > hoje) {
    voltarComErro("A data de execução não pode estar no futuro.")
  }

  const supabase = await createClient()

  // Busca a atividade no banco em vez de confiar no que veio do formulário:
  // é daqui que copiamos a pontuação, e é aqui que garantimos que está ativa.
  const { data: atividade } = await supabase
    .from("atividades")
    .select("id, pontuacao, status")
    .eq("id", atividadeId)
    .single()

  if (!atividade || atividade.status !== "ativo") {
    voltarComErro("Atividade inválida ou inativa.")
  }

  // O servidor é a fonte da verdade: confirma que todos os ids enviados são
  // de membros ativos, mesmo que a requisição tenha sido manipulada.
  const { data: membrosValidos } = await supabase
    .from("perfis")
    .select("id")
    .in("id", membrosIds)
    .eq("papel", "membro")
    .eq("status", "ativo")

  if (membrosValidos?.length !== membrosIds.length) {
    voltarComErro("Um ou mais membros selecionados são inválidos ou estão inativos.")
  }

  // "pontos" é uma CÓPIA da pontuação da atividade neste momento. Assim,
  // se a atividade for editada depois, os lançamentos antigos não mudam.
  // "lancado_por" não é enviado: o banco preenche com auth.uid() por padrão.
  const linhas = membrosIds.map((membroId) => ({
    membro_id: membroId,
    atividade_id: atividade.id,
    pontos: atividade.pontuacao,
    data_execucao: dataExecucao,
  }))

  const { error } = await supabase.from("lancamentos").insert(linhas)

  if (error) {
    voltarComErro(error.message)
  }

  revalidatePath("/lancamentos")
  redirect("/lancamentos")
}