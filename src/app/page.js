import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { logout } from "./login/actions"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("email, papel, status")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-8">
      <div className="max-w-sm text-center">
        <p className="text-sm text-[#8892A6]">PET-EP Gamifica</p>
        <h1 className="mt-3 font-bold text-3xl text-[#12192B]">
          Bem-vindo(a)
        </h1>
        <p className="mt-4 text-[#8892A6]">
          {perfil?.email}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 text-sm text-[#12192B]">
          <span className="w-2 h-2 rounded-full bg-[#E8A33D]" />
          {perfil?.papel === "coordenador" ? "Coordenador" : "Membro"} · {perfil?.status}
        </div>
        <p className="mt-10 text-sm text-[#8892A6]">
          O Painel de Líderes e o extrato de pontos ainda estão a caminho.
        </p>

        <form action={logout} className="mt-8">
          <button
            type="submit"
            className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2 transition-colors"
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  )
}