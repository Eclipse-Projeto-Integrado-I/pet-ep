// Converte "AAAA-MM-DD" (formato das colunas "date" do Postgres) em "DD/MM/AAAA".
// Faz isso só reorganizando o texto, SEM usar new Date(): o JavaScript trataria
// a string como meia-noite em UTC e, no fuso de Fortaleza (UTC-3),
// exibiria o dia anterior.
export function formatarData(dataIso) {
  if (!dataIso) return "—"
  const [ano, mes, dia] = dataIso.split("-")
  return `${dia}/${mes}/${ano}`
}

// Formata um instante completo (coluna "timestamptz", como "excluido_em")
// no horário de Fortaleza. Aqui o uso de new Date() é seguro: diferente da
// coluna "date" (só AAAA-MM-DD, sem hora), o timestamptz já traz o instante
// exato com fuso, e o timeZone explícito deixa o resultado igual em qualquer
// máquina.
export function formatarDataHora(instante) {
  if (!instante) return "—"
  return new Date(instante).toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    dateStyle: "short",
    timeStyle: "short",
  })
}