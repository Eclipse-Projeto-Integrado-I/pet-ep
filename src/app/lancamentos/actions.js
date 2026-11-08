"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Corrige um lançamento existente (membro, atividade e/ou data).
//
// Regras de pontuação:
// - Se a atividade NÃO mudou, os pontos originais são mantidos (mesmo que a
//   atividade tenha sido editada depois).
// - Se a atividade mudou, os pontos passam a ser os da nova atividade.
//
// Apenas membro, atividade, pontos e data são enviados no UPDATE.
// "created_at" (base do prazo de 10 dias da RN04) e "lancado_por" (auditoria)
// nunca são tocados.
export async function atualizarLancamento(formData) {
  const id = formData.get("id")
  const membroId = formData.get("membro")
  const atividadeId = formData.get("atividade")
  const dataExecucao = formData.get("dataExecucao")

  const voltarComErro = (mensagem) =>
    redirect(`/lancamentos/${id}/editar?erro=${encodeURIComponent(mensagem)}`)

  // Data de hoje no fuso de Fortaleza (AAAA-MM-DD).
  const hoje = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Fortaleza",
  })

  if (!dataExecucao || dataExecucao > hoje) {
    voltarComErro("A data de execução não pode estar no futuro.")
  }

  const supabase = await createClient()

  // Estado atual do lançamento. Lançamentos já excluídos não podem ser editados.
  const { data: atual } = await supabase
    .from("lancamentos")
    .select("membro_id, atividade_id, pontos")
    .eq("id", id)
    .is("excluido_em", null)
    .single()

  if (!atual) {
    voltarComErro("Lançamento não encontrado ou já excluído.")
  }

  const dadosAtualizados = {
    membro_id: membroId,
    atividade_id: atividadeId,
    pontos: atual.pontos,
    data_execucao: dataExecucao,
  }

  // Só revalidamos o membro se ele foi trocado. Se continua o mesmo, não há
  // problema em ele estar inativo hoje (o lançamento é histórico).
  if (membroId !== atual.membro_id) {
    const { data: membro } = await supabase
      .from("perfis")
      .select("id")
      .eq("id", membroId)
      .eq("papel", "membro")
      .eq("status", "ativo")
      .single()

    if (!membro) {
      voltarComErro("O membro selecionado é inválido ou está inativo.")
    }
  }

  // Mesma lógica para a atividade. O id vem do banco como número e do
  // formulário como texto, por isso a conversão na comparação.
  if (String(atual.atividade_id) !== atividadeId) {
    const { data: atividade } = await supabase
      .from("atividades")
      .select("id, pontuacao, status")
      .eq("id", atividadeId)
      .single()

    if (!atividade || atividade.status !== "ativo") {
      voltarComErro("A atividade selecionada é inválida ou está inativa.")
    }

    // Atividade trocada: os pontos passam a ser os da nova atividade.
    dadosAtualizados.pontos = atividade.pontuacao
  }

  const { error } = await supabase
    .from("lancamentos")
    .update(dadosAtualizados)
    .eq("id", id)
    .is("excluido_em", null)

  if (error) {
    voltarComErro(error.message)
  }

  revalidatePath("/lancamentos")
  redirect("/lancamentos")
}
// Exclui um lançamento de forma LÓGICA: a linha continua no banco, marcada
// com quem excluiu e quando. Isso mantém a trilha de auditoria e evita
// "buracos" para membros que já foram notificados dos pontos (RF10) ou que
// possam abrir uma solicitação de ajuste (RF11).
//
// IMPORTANTE: toda consulta que some pontos (listagem, extrato, ranking)
// precisa filtrar .is("excluido_em", null). Se esquecer o filtro, lançamentos
// excluídos voltam a contar pontos.
export async function excluirLancamento(formData) {
  const id = formData.get("id")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // O .select("id") devolve as linhas realmente alteradas. Se vier vazio, o
  // lançamento não existe ou já estava excluído (o filtro .is evita
  // sobrescrever quem excluiu primeiro).
  const { data, error } = await supabase
    .from("lancamentos")
    .update({
      excluido_em: new Date().toISOString(),
      excluido_por: user.id,
    })
    .eq("id", id)
    .is("excluido_em", null)
    .select("id")

  if (error || !data?.length) {
    const mensagem = error?.message ?? "Lançamento não encontrado ou já excluído."
    redirect(`/lancamentos?erro=${encodeURIComponent(mensagem)}`)
  }

  revalidatePath("/lancamentos")
  revalidatePath("/lancamentos/excluidos")
}