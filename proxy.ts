import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { decideAdminRouteAccess } from "@/lib/auth/permissions";

export async function proxy(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            request.cookies.set(cookie.name, cookie.value);
          }

          response = NextResponse.next({
            request,
          });

          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const decision = decideAdminRouteAccess({ authenticated: false, role: null, pathname: request.nextUrl.pathname });
    return NextResponse.redirect(new URL(decision.redirectTo ?? "/login", request.url));
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (request.nextUrl.pathname.startsWith("/onboarding")) {
    return response;
  }

  const decision = decideAdminRouteAccess({
    authenticated: true,
    role: membership?.role ?? null,
    pathname: request.nextUrl.pathname,
  });

  if (!decision.allowed) {
    return NextResponse.redirect(new URL(decision.redirectTo ?? "/portal", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/onboarding/:path*"],
};
