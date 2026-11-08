import Link from "next/link"
import { ITENS_POR_PAGINA, montarUrl } from "@/lib/paginacao"

export default function ControlesPaginacao({
  caminho,
  pagina,
  totalPaginas,
  total,
  busca,
}) {
  if (total === 0) return null

  const inicio = (pagina - 1) * ITENS_POR_PAGINA + 1
  const fim = Math.min(pagina * ITENS_POR_PAGINA, total)

  const estiloAtivo =
    "rounded-lg border border-gray-300 px-4 py-2 text-sm text-[#12192B] hover:bg-gray-50 transition-colors"
  const estiloInativo =
    "rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-300 cursor-not-allowed"

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-[#8892A6]">
        Mostrando {inicio}–{fim} de {total}
      </p>

      {totalPaginas > 1 && (
        <nav aria-label="Paginação" className="flex items-center gap-3">
          {pagina > 1 ? (
            <Link
              href={montarUrl(caminho, { busca, pagina: pagina - 1 })}
              className={estiloAtivo}
            >
              Anterior
            </Link>
          ) : (
            <span aria-disabled="true" className={estiloInativo}>
              Anterior
            </span>
          )}

          <span className="text-sm text-[#8892A6]">
            Página {pagina} de {totalPaginas}
          </span>

          {pagina < totalPaginas ? (
            <Link
              href={montarUrl(caminho, { busca, pagina: pagina + 1 })}
              className={estiloAtivo}
            >
              Próxima
            </Link>
          ) : (
            <span aria-disabled="true" className={estiloInativo}>
              Próxima
            </span>
          )}
        </nav>
      )}
    </div>
  )
}