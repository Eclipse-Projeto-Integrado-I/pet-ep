"use client"

import { useState } from "react"

export default function SeletorMembros({ membros }) {
  const [selecionados, setSelecionados] = useState([])

  function alternar(id) {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    )
  }

  const todosSelecionados =
    membros.length > 0 && selecionados.length === membros.length

  function alternarTodos() {
    setSelecionados(todosSelecionados ? [] : membros.map((m) => m.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-[#12192B]">Membros</span>
        {/* type="button" evita que este botão envie o formulário */}
        <button
          type="button"
          onClick={alternarTodos}
          className="text-sm text-[#8892A6] underline underline-offset-2 hover:text-[#12192B]"
        >
          {todosSelecionados ? "Limpar seleção" : "Selecionar todos"}
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-300 divide-y divide-gray-100">
        {membros.map((membro) => (
          <label
            key={membro.id}
            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50"
          >
            {/* name="membros" é o que a Server Action lê com formData.getAll */}
            <input
              type="checkbox"
              name="membros"
              value={membro.id}
              checked={selecionados.includes(membro.id)}
              onChange={() => alternar(membro.id)}
              className="accent-[#12192B]"
            />
            <span className="text-[#12192B]">{membro.nome || membro.email}</span>
          </label>
        ))}
      </div>

      <p className="mt-1.5 text-sm text-[#8892A6]">
        {selecionados.length === 0 && "Nenhum membro selecionado"}
        {selecionados.length === 1 && "1 membro selecionado (lançamento individual)"}
        {selecionados.length > 1 &&
          `${selecionados.length} membros selecionados (lançamento em lote)`}
      </p>
    </div>
  )
}