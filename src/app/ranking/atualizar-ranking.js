"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// Mantém o Painel de Líderes atualizado sem recarregar a página.
//
// Escuta o canal privado "ranking". Um trigger no banco envia um aviso
// ("mudou") quando lançamentos ou perfis mudam. O aviso NÃO carrega dados:
// ao recebê-lo, pedimos ao Next.js para refazer a renderização do servidor,
// que consulta a função ranking_periodo. Assim cada usuário só vê o que a
// função permite, e nunca os lançamentos dos outros.
export default function AtualizarRanking() {
  const router = useRouter()
  const [estado, setEstado] = useState("conectando")
  const temporizador = useRef(null)

  useEffect(() => {
    const supabase = createClient()
    let canal = null
    let ativo = true

    // Vários avisos em sequência (ex: correções seguidas) viram uma única
    // atualização, 500 ms depois do último.
    function agendarAtualizacao() {
      clearTimeout(temporizador.current)
      temporizador.current = setTimeout(() => router.refresh(), 500)
    }

    async function conectar() {
      // Necessário em canais privados (Realtime Authorization): entrega ao
      // Realtime o token do usuário logado.
      await supabase.realtime.setAuth()
      if (!ativo) return

      canal = supabase
        .channel("ranking", { config: { private: true } })
        .on("broadcast", { event: "mudou" }, agendarAtualizacao)
        .subscribe((status) => {
          if (!ativo) return
          if (status === "SUBSCRIBED") setEstado("ativo")
          else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setEstado("erro")
          }
        })
    }

    // Celulares suspendem a conexão quando a aba vai para segundo plano e
    // avisos podem se perder. Ao voltar para a aba, atualizamos por garantia.
    function aoVoltarParaAba() {
      if (document.visibilityState === "visible") router.refresh()
    }

    conectar()
    document.addEventListener("visibilitychange", aoVoltarParaAba)

    return () => {
      ativo = false
      clearTimeout(temporizador.current)
      document.removeEventListener("visibilitychange", aoVoltarParaAba)
      if (canal) supabase.removeChannel(canal)
    }
  }, [router])

  const textos = {
    conectando: "Conectando...",
    ativo: "Atualização automática ativa",
    erro: "Atualização automática indisponível. Recarregue a página.",
  }

  const cores = {
    conectando: "bg-gray-300",
    ativo: "bg-green-500",
    erro: "bg-red-500",
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm text-[#8892A6]">
      <span className={`w-2 h-2 rounded-full ${cores[estado]}`} />
      {textos[estado]}
    </span>
  )
}