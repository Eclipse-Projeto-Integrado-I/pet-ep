"use client"

import { useFormStatus } from "react-dom"

export default function BotaoExcluir() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        // Se o usuário cancelar, bloqueamos o envio do formulário.
        const confirmou = window.confirm(
          "Excluir este lançamento? Os pontos deixarão de contar para o membro."
        )
        if (!confirmou) {
          e.preventDefault()
        }
      }}
      className="text-sm text-[#8892A6] underline underline-offset-2 hover:text-red-600 disabled:opacity-60"
    >
      {pending ? "Excluindo..." : "Excluir"}
    </button>
  )
}