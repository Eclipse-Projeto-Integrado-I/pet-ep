import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente administrativo do Supabase: usa a service_role key, que
// IGNORA o RLS e tem privilégios totais sobre o banco.
//
// ⚠️ NUNCA importe este arquivo em um Client Component ("use client").
// Ele só pode ser usado dentro de Server Actions ou Route Handlers,
// porque a service_role key nunca pode ser exposta ao navegador.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}