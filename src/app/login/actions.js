"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Autentica o usuário com e-mail e senha.
// Em caso de erro, redireciona de volta para /login com a mensagem
// na URL. Em caso de sucesso, o Supabase já grava os cookies de sessão
// automaticamente (via o cliente de servidor), e redirecionamos para a home.
export async function login(formData) {
  const supabase = await createClient()

  const email = formData.get("email")
  const senha = formData.get("senha")

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  })

  if (error) {
    redirect(`/login?erro=${encodeURIComponent("E-mail ou senha inválidos")}`)
  }

  redirect("/")
}

// Encerra a sessão do usuário atual: invalida o token no Supabase
// e remove os cookies de autenticação do navegador.
export async function logout() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect("/login")
}