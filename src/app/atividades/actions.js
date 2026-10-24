"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Atualiza os dados de uma atividade existente.
// A foto só é alterada se uma nova for realmente enviada. Se o campo
// ficar vazio, a foto atual é mantida (o campo foto_url nem entra no UPDATE).
export async function atualizarAtividade(formData) {
  const id = formData.get("id")
  const nome = formData.get("nome")
  const descricao = formData.get("descricao")
  const pontuacao = formData.get("pontuacao")
  const foto = formData.get("foto")

  const supabase = await createClient()

  const dadosAtualizados = {
    nome,
    descricao: descricao || null,
    pontuacao: parseInt(pontuacao, 10),
  }

  if (foto && foto.size > 0) {
    const nomeArquivo = `${crypto.randomUUID()}-${foto.name}`

    const { error: erroUpload } = await supabase.storage
      .from("atividades")
      .upload(nomeArquivo, foto)

    if (erroUpload) {
      redirect(`/atividades/${id}/editar?erro=${encodeURIComponent(erroUpload.message)}`)
    }

    const { data: urlPublica } = supabase.storage
      .from("atividades")
      .getPublicUrl(nomeArquivo)

    // Só adiciona foto_url ao UPDATE quando há uma foto nova.
    // ATENÇÃO: a foto antiga NÃO é apagada do bucket, ela fica órfã
    // (sem nenhuma atividade apontando para ela). Pendência conhecida.
    dadosAtualizados.foto_url = urlPublica.publicUrl
  }

  const { error } = await supabase
    .from("atividades")
    .update(dadosAtualizados)
    .eq("id", id)

  if (error) {
    redirect(`/atividades/${id}/editar?erro=${encodeURIComponent(error.message)}`)
  }

  // Avisa o Next.js que a listagem mudou, para buscar dados novos.
  revalidatePath("/atividades")
  redirect("/atividades")
}

// Alterna o status da atividade entre "ativo" e "inativo".
// IMPORTANTE: nunca faz DELETE. Futuramente, os lançamentos de pontuação
// vão referenciar atividades. Apagar uma atividade já usada quebraria
// (ou apagaria, se a FK fosse CASCADE) o histórico de pontos dos membros.
// Inativar preserva o histórico e, mais adiante, tira a atividade da lista
// de opções disponíveis para novos lançamentos.
export async function alternarStatusAtividade(formData) {
  const id = formData.get("id")
  const statusAtual = formData.get("statusAtual")

  const supabase = await createClient()

  const novoStatus = statusAtual === "ativo" ? "inativo" : "ativo"

  await supabase
    .from("atividades")
    .update({ status: novoStatus })
    .eq("id", id)

  revalidatePath("/atividades")
}