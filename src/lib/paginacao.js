// Quantos itens aparecem por página. Para testar sem precisar de muitos
// registros, troque temporariamente por 2.
export const ITENS_POR_PAGINA = 20

// Converte o parâmetro "?pagina=" em um número válido (inteiro >= 1).
// Qualquer valor estranho ("abc", "0", "-3") vira página 1.
export function lerPagina(valor) {
  const numero = parseInt(valor, 10)
  return Number.isInteger(numero) && numero >= 1 ? numero : 1
}

// Posições inicial e final (base 0, inclusivas) que o .range() do Supabase espera.
// Página 1 => 0 a 19; página 2 => 20 a 39; e assim por diante.
export function intervaloDaPagina(pagina, porPagina = ITENS_POR_PAGINA) {
  const de = (pagina - 1) * porPagina
  return { de, ate: de + porPagina - 1 }
}

// Sempre pelo menos 1 página, mesmo sem nenhum registro.
export function totalDePaginas(total, porPagina = ITENS_POR_PAGINA) {
  return Math.max(1, Math.ceil(total / porPagina))
}

// Monta o endereço de uma página preservando a busca.
// A página 1 não leva "?pagina=" para manter a URL limpa.
export function montarUrl(caminho, { busca, pagina }) {
  const params = new URLSearchParams()
  if (busca) params.set("busca", busca)
  if (pagina && pagina > 1) params.set("pagina", String(pagina))
  const texto = params.toString()
  return texto ? `${caminho}?${texto}` : caminho
}