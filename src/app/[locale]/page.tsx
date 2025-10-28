'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se usuário está autenticado
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          // Redirecionar baseado no tipo de usuário
          if (user.tipo === 'admin') {
            router.push('/pt/admin');
          } else if (user.tipo === 'parceiro') {
            router.push('/pt/parceiro');
          } else {
            router.push('/pt/dashboard');
          }
        } else {
          // Usuário não autenticado, redirecionar para login
          router.push('/pt/login');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/pt/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verificando autenticação...</p>
      </div>
    </div>
  );
}