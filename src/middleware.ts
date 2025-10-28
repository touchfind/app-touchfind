import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Lista de idiomas suportados
  locales: ['pt', 'en'],
  
  // Idioma padrão
  defaultLocale: 'pt',
  
  // Estratégia de detecção de idioma
  localeDetection: true
});

export const config = {
  // Aplicar middleware apenas às rotas que precisam de i18n
  matcher: [
    // Incluir todas as rotas exceto API, _next/static, _next/image, favicon.ico
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};