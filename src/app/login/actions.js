"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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

export async function logout() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect("/login")
}