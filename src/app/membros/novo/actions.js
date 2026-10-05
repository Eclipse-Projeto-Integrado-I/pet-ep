"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Cadastra um novo membro no sistema. Só pode ser chamada por um
// coordenador (garantido pelo proxy.js, que já bloqueia o acesso
// a /membros/novo para quem não tem essa permissão).
export async function cadastrarMembro(formData) {
  const nome = formData.get("nome")
  const email = formData.get("email")
  const senha = formData.get("senha")
  const dataIngresso = formData.get("dataIngresso")

  // Precisa do cliente ADMINISTRATIVO (service role key) porque criar
  // um usuário com senha definida é uma operação privilegiada, que
  // ignora o fluxo normal de autoconfirmação por e-mail.
  const adminClient = createAdminClient()

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true, // dispensa o link de confirmação por e-mail
  })

  if (error) {
    redirect(`/membros/novo?erro=${encodeURIComponent(error.message)}`)
  }

  // A trigger "ao_criar_novo_usuario" já disparou automaticamente neste
  // ponto, criando o registro em "perfis" com papel="membro" e
  // status="ativo" (valores default). Aqui só completamos os dados
  // que a trigger não preenche (ela só conhece id e email).
  const supabase = await createClient()

  const { error: erroPerfil } = await supabase
    .from("perfis")
    .update({
      nome,
      data_ingresso: dataIngresso,
    })
    .eq("id", data.user.id)

  if (erroPerfil) {
    redirect(`/membros/novo?erro=${encodeURIComponent(erroPerfil.message)}`)
  }

  redirect("/membros")
}