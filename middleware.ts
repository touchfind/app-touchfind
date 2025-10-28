import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout'];
  const publicPatterns = ['/p/', '/_next/', '/favicon.ico', '/icon.svg']; // Rotas que começam com estes padrões
  
  // Verificar se é rota pública
  if (publicRoutes.includes(pathname) || pathname === '/' || 
      publicPatterns.some(pattern => pathname.startsWith(pattern))) {
    return NextResponse.next();
  }

  try {
    // Ler cookie auth-token
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Validar JWT (usar o mesmo segredo JWT_SECRET)
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const userType = payload.tipo;

    // Proteger rotas baseadas no tipo de usuário
    // /admin/** → apenas tipo==='admin'
    if (pathname.startsWith('/admin') && userType !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // /parceiro/** → tipo==='parceiro' ou admin
    if (pathname.startsWith('/parceiro') && userType !== 'parceiro' && userType !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // /dashboard/** → qualquer utilizador autenticado
    // (já verificado que tem token válido acima)

    // Redirecionar admin e parceiro para suas respectivas áreas se tentarem acessar dashboard
    if (pathname.startsWith('/dashboard') && userType === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (pathname.startsWith('/dashboard') && userType === 'parceiro') {
      return NextResponse.redirect(new URL('/parceiro', request.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error('Erro no middleware:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
};