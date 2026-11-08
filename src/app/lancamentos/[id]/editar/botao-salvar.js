"use client"

import { useFormStatus } from "react-dom"

export default function BotaoSalvar() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-[#12192B] text-white font-medium py-2.5 hover:bg-[#1c2740] transition-colors disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Salvar alterações"}
    </button>
  )
}