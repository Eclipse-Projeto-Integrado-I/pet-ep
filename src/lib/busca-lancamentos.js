// Traduz o termo digitado em um filtro de lançamentos.
//
// O nome do membro e o da atividade ficam em OUTRAS tabelas, e o Supabase não
// faz "OU" entre duas tabelas relacionadas numa consulta só. Por isso:
// 1) achamos os ids dos membros e das atividades que combinam com o termo;
// 2) devolvemos um filtro pelos ids encontrados.
//
// Retorno:
// - { filtro: null, semResultados: false } -> sem busca, não filtra nada
// - { filtro: "...", semResultados: false } -> filtro para usar em query.or(filtro)
// - { filtro: null, semResultados: true }  -> nada combina, não há o que buscar
export async function montarFiltroBusca(supabase, busca) {
  if (!busca) return { filtro: null, semResultados: false }

  const [{ data: membros }, { data: atividades }] = await Promise.all([
    // Sem filtro de status: lançamentos antigos de membros inativos
    // também precisam ser encontráveis.
    supabase
      .from("perfis")
      .select("id")
      .eq("papel", "membro")
      .or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`),
    supabase.from("atividades").select("id").ilike("nome", `%${busca}%`),
  ])

  const condicoes = []

  if (membros?.length) {
    condicoes.push(`membro_id.in.(${membros.map((m) => m.id).join(",")})`)
  }

  if (atividades?.length) {
    condicoes.push(`atividade_id.in.(${atividades.map((a) => a.id).join(",")})`)
  }

  if (condicoes.length === 0) return { filtro: null, semResultados: true }

  return { filtro: condicoes.join(","), semResultados: false }
}