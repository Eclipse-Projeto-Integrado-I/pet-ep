import { updateSession } from '@/lib/supabase/middleware'

// ATENÇÃO (Next.js 16): este arquivo PRECISA se chamar "proxy.js" (nas versões
// anteriores era "middleware.js") e a função exportada PRECISA se chamar "proxy".
// Como o projeto usa a pasta "src/", ele também PRECISA ficar em "src/proxy.js",
// no mesmo nível de "src/app". Em outro lugar, ou com outro nome, o Next.js o
// ignora em silêncio: sem erro, sem log, e nenhuma rota fica protegida.
//
// A lógica em si (renovar a sessão e bloquear rotas por login e papel) fica em
// "lib/supabase/middleware.js". Aqui só chamamos essa função a cada requisição.
export async function proxy(request) {
  return await updateSession(request)
}

export const config = {
  // Roda em todas as rotas, exceto arquivos estáticos e imagens, que não
  // precisam de verificação de sessão.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}