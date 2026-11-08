// Remove caracteres com significado especial na sintaxe de filtros do
// Supabase (vírgula e parênteses separam condições; % e * são curingas).
// Sem isso, digitar uma vírgula na busca quebraria a consulta.
export function limparBusca(texto) {
  if (!texto) return ""
  return String(texto)
    .replace(/[,()%*\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}