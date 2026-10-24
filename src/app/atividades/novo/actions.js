"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Cadastra uma nova atividade. Só pode ser chamada por um coordenador:
// o proxy.js não bloqueia /atividades (só /membros), então a proteção
// real fica nas policies de RLS da tabela "atividades" e nas policies
// de Storage do bucket "atividades", que exigem usuario_e_coordenador().
export async function cadastrarAtividade(formData) {
  const nome = formData.get("nome")
  const descricao = formData.get("descricao")
  const pontuacao = formData.get("pontuacao")
  const foto = formData.get("foto")

  const supabase = await createClient()

  let fotoUrl = null

  // A foto é opcional. Quando nenhum arquivo é selecionado, o navegador
  // ainda envia um File vazio (size === 0), por isso checamos o tamanho
  // antes de tentar o upload.
  if (foto && foto.size > 0) {
    // O UUID no início do nome evita que duas fotos com o mesmo nome
    // original (ex: "foto.jpg") se sobrescrevam no bucket.
    const nomeArquivo = `${crypto.randomUUID()}-${foto.name}`

    const { error: erroUpload } = await supabase.storage
      .from("atividades")
      .upload(nomeArquivo, foto)

    if (erroUpload) {
      redirect(`/atividades/novo?erro=${encodeURIComponent(erroUpload.message)}`)
    }

    // O bucket é público, então getPublicUrl só monta a URL definitiva
    // da imagem (não faz chamada de rede). Guardamos essa URL no banco,
    // e não o arquivo em si.
    const { data: urlPublica } = supabase.storage
      .from("atividades")
      .getPublicUrl(nomeArquivo)

    fotoUrl = urlPublica.publicUrl
  }

  // Dados de formulário sempre chegam como string. A pontuação precisa
  // virar número inteiro antes de ser gravada na coluna int4.
  const { error: erroAtividade } = await supabase.from("atividades").insert({
    nome,
    descricao: descricao || null, // string vazia vira NULL no banco
    pontuacao: parseInt(pontuacao, 10),
    foto_url: fotoUrl,
  })

  if (erroAtividade) {
    redirect(`/atividades/novo?erro=${encodeURIComponent(erroAtividade.message)}`)
  }

  redirect("/atividades")
}