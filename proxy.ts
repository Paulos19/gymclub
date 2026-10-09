import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/workouts",
  "/evolution",
  "/photos",
  "/ai-coach",
  "/profile",
];

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Obter token JWT de sessão do NextAuth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // 2. Proteção de Rotas do Dashboard para Usuários Não Autenticados
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Usuários Já Autenticados NÃO podem retornar ao Login ou Cadastro
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 4. Headers de Segurança
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=()"
  );

  return response;
}

export default proxy;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workouts/:path*",
    "/evolution/:path*",
    "/photos/:path*",
    "/ai-coach/:path*",
    "/profile/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
