import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase" // We'll create this next

// Define a function to create the Supabase client for browser usage
// This ensures it's a singleton.
let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return client
}

// You would also create a server client for server-side operations (e.g., in Route Handlers or Server Actions)
// For now, we'll focus on the browser client as most ICP management might happen client-side.
// import { createServerClient, type CookieOptions } from '@supabase/ssr'
// import { cookies } from 'next/headers'
//
// export function getSupabaseServerClient() {
//   const cookieStore = cookies()
//   return createServerClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server-side
//     {
//       cookies: {
//         get(name: string) {
//           return cookieStore.get(name)?.value
//         },
//         set(name: string, value: string, options: CookieOptions) {
//           cookieStore.set({ name, value, ...options })
//         },
//         remove(name: string, options: CookieOptions) {
//           cookieStore.delete({ name, ...options })
//         },
//       },
//     }
//   )
// }
