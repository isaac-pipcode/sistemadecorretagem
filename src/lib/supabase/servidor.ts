import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para uso no servidor (Server Components e Server Actions).
 * Em Server Components a gravação de cookies não é permitida — o try/catch
 * ignora esse caso, porque o proxy já renova a sessão a cada requisição.
 */
export async function criarClienteServidor() {
  const armazenamento = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return armazenamento.getAll();
        },
        setAll(cookiesNovos) {
          try {
            for (const { name, value, options } of cookiesNovos) {
              armazenamento.set(name, value, options);
            }
          } catch {
            // Server Component: sem permissão para gravar cookies.
          }
        },
      },
    },
  );
}

/** Devolve a usuária autenticada ou lança erro — usar em toda Server Action. */
export async function exigirUsuaria() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Entre novamente.");
  return { supabase, user };
}
