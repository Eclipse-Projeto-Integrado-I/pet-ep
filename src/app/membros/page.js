import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { alternarStatusMembro } from "./actions"

export default async function MembrosPage({ searchParams }) {
  const params = await searchParams
  const busca = params?.busca || ""

  const supabase = await createClient()

  let query = supabase
  .from("perfis")
  .select("id, nome, email, curso, papel, status, data_ingresso")
  .eq("papel", "membro")
  .order("nome", { ascending: true })

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`)
  }

    const { data: membros } = await query

  return (
    <div className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="text-sm text-[#8892A6] hover:text-[#12192B] underline underline-offset-2"
        >
          ← Voltar para o início
        </Link>

        <div className="flex items-center justify-between mt-4 mb-8">
          <div>
            <p className="text-sm text-[#8892A6]">PET-EP Gamifica</p>
            <h1 className="mt-1 font-bold text-3xl text-[#12192B]">Membros</h1>
          </div>
          <Link
            href="/membros/novo"
            className="rounded-lg bg-[#12192B] text-white font-medium px-5 py-2.5 hover:bg-[#1c2740] transition-colors"
          >
            + Novo membro
          </Link>
        </div>

        <form className="mb-6">
          <input
            type="text"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 text-[#12192B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
          />
        </form>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-[#8892A6]">
              <tr>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">E-mail</th>
                <th className="px-5 py-3 font-medium">Curso</th>
                <th className="px-5 py-3 font-medium">Papel</th>
                <th className="px-5 py-3 font-medium">Ingresso</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {membros?.map((membro) => (
                <tr key={membro.id}>
                  <td className="px-5 py-3 text-[#12192B]">{membro.nome}</td>
                  <td className="px-5 py-3 text-[#8892A6]">{membro.email}</td>
                  <td className="px-5 py-3 text-[#8892A6]">{membro.curso}</td>
                  <td className="px-5 py-3 text-[#8892A6] capitalize">{membro.papel}</td>
                  <td className="px-5 py-3 text-[#8892A6]">
                    {membro.data_ingresso
                      ? new Date(membro.data_ingresso).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        membro.status === "ativo"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          membro.status === "ativo" ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      {membro.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/membros/${membro.id}/editar`}
                        className="text-sm text-[#12192B] underline underline-offset-2 hover:text-[#E8A33D]"
                      >
                        Editar
                      </Link>
                      <form action={alternarStatusMembro}>
                        <input type="hidden" name="id" value={membro.id} />
                        <input type="hidden" name="statusAtual" value={membro.status} />
                        <button
                          type="submit"
                          className="text-sm text-[#8892A6] underline underline-offset-2 hover:text-[#12192B]"
                        >
                          {membro.status === "ativo" ? "Inativar" : "Reativar"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {membros?.length === 0 && (
            <p className="text-center text-[#8892A6] py-10">
              Nenhum membro encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}