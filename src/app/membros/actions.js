"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Alterna o status do membro entre "ativo" e "inativo".
// IMPORTANTE: nunca faz DELETE — isso garante que o histórico de
// pontuação do membro (lançamentos, badges, etc.) seja preservado,
// mesmo depois que ele for inativado.
export async function alternarStatusMembro(formData) {
  const id = formData.get("id")
  const statusAtual = formData.get("statusAtual")

  const supabase = await createClient()

  const novoStatus = statusAtual === "ativo" ? "inativo" : "ativo"

  await supabase
    .from("perfis")
    .update({ status: novoStatus })
    .eq("id", id)

  // Avisa o Next.js que os dados de /membros mudaram, forçando
  // a página a buscar a versão atualizada na próxima renderização.
  revalidatePath("/membros")
}

// Atualiza os dados cadastrais de um membro já existente.
// Precisa mexer em DUAS fontes de dados: auth.users (onde o e-mail
// é usado para login) e perfis (nosso espelho com os dados extras).
export async function atualizarMembro(formData) {
  const id = formData.get("id")
  const nome = formData.get("nome")
  const email = formData.get("email")
  const curso = formData.get("curso")
  const dataIngresso = formData.get("dataIngresso")

  // updateUserById só existe no cliente ADMINISTRATIVO, porque alterar
  // dados de autenticação de OUTRA pessoa (não quem está logado) é uma
  // operação privilegiada.
  const adminClient = createAdminClient()

  const { error: erroAuth } = await adminClient.auth.admin.updateUserById(id, {
    email,
    email_confirm: true,
  })

  if (erroAuth) {
    redirect(`/membros/${id}/editar?erro=${encodeURIComponent(erroAuth.message)}`)
  }

  // Esse UPDATE usa o cliente comum (não o admin), porque já está
  // protegido pela policy de RLS "coordenadores_atualizam_todos_perfis".
  const supabase = await createClient()

  const { error: erroPerfil } = await supabase
    .from("perfis")
    .update({ nome, email, curso, data_ingresso: dataIngresso })
    .eq("id", id)

  if (erroPerfil) {
    redirect(`/membros/${id}/editar?erro=${encodeURIComponent(erroPerfil.message)}`)
  }

  revalidatePath("/membros")
  redirect("/membros")
}