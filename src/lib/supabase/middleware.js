import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  // Resposta "padrão": deixa a requisição seguir normalmente.
  // Pode ser substituída mais abaixo, caso seja necessário
  // renovar cookies de sessão ou redirecionar o usuário.
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Chamado pelo Supabase quando precisa LER a sessão atual.
        getAll() {
          return request.cookies.getAll()
        },
        // Chamado pelo Supabase quando precisa RENOVAR o token de sessão
        // (ex: quando o token antigo está perto de expirar).
        // Precisa atualizar tanto a requisição atual quanto a resposta
        // devolvida ao navegador, para que os dois fiquem sincronizados.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verifica se existe uma sessão válida. Essa chamada também é o
  // gatilho que aciona a renovação automática do token, se necessário.
  const { data: { user } } = await supabase.auth.getUser()

  const rota = request.nextUrl.pathname

  // REGRA 1: ninguém sem sessão pode acessar nenhuma rota, exceto /login.
  if (!user && rota !== '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // REGRA 2: quem já está logado não precisa ver a tela de login de novo.
  if (user && rota === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // REGRA 3: área de gestão de membros é restrita a coordenadores ativos.
  // Consulta o papel/status do usuário logado e bloqueia o acesso
  // (redirecionando para a home) caso ele não seja coordenador ativo.
  // Essa checagem acontece ANTES da página carregar — ninguém sem
  // permissão chega a ver o conteúdo, nem por um instante.
  if (user && rota.startsWith('/membros')) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('papel, status')
      .eq('id', user.id)
      .single()

    if (perfil?.papel !== 'coordenador' || perfil?.status !== 'ativo') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}