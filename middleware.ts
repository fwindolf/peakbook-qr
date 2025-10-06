import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "./src/i18n/routing"

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // Handle locale routing first
  const response = intlMiddleware(request)

  // Create a Supabase client for auth
  let supabaseResponse = response || NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = response || NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith("/admin") || pathname.match(/^\/[a-z]{2}\/admin/)
  const isLoginRoute = pathname.startsWith("/login") || pathname.match(/^\/[a-z]{2}\/login/)
  const isPublicRoute = !isAdminRoute && !isLoginRoute

  // Allow public access to landing page and API routes
  if (isPublicRoute) {
    return supabaseResponse
  }

  // Redirect to login if not authenticated and trying to access admin routes
  if (!user && isAdminRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect to admin dashboard if authenticated and trying to access login
  if (user && isLoginRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
