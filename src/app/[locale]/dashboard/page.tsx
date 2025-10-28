'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import LanguageToggle from '@/components/LanguageToggle';

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: string;
}

interface Pulseira {
  id: string;
  identificador: string;
  cliente_id: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [pulseiras, setPulseiras] = useState<Pulseira[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Buscar pulseiras do cliente
        if (data.user.tipo === 'cliente') {
          await fetchPulseiras();
        }
      } else {
        router.push('/pt/login');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      router.push('/pt/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchPulseiras = async () => {
    try {
      const response = await fetch('/api/me/pulseiras');
      if (response.ok) {
        const data = await response.json();
        setPulseiras(data.pulseiras);
      }
    } catch (error) {
      console.error('Erro ao buscar pulseiras:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/pt/login');
      router.refresh();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">{t('dashboard.title')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <span className="text-gray-700">{t('dashboard.welcome', { name: user?.nome })}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('dashboard.myBracelets')}
            </h2>
            
            {pulseiras.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('dashboard.noBracelets')}
                </h3>
                <p className="text-gray-500">
                  {t('dashboard.noBraceletsDescription')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pulseiras.map((pulseira) => (
                  <div key={pulseira.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {pulseira.identificador}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('common.active')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-6">
                        {t('dashboard.createdOn')} {new Date(pulseira.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      
                      <div className="flex space-x-3">
                        <Link
                          href={`/pt/dashboard/pulseiras/${pulseira.id}/editar`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
                        >
                          {t('dashboard.editSos')}
                        </Link>
                        <Link
                          href={`/pt/sos/${pulseira.identificador}`}
                          target="_blank"
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
                        >
                          {t('dashboard.preview')}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('dashboard.activeBracelets')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {pulseiras.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('dashboard.dataConfigured')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {pulseiras.length > 0 ? t('common.yes') : t('common.no')}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {t('dashboard.lastUpdate')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {pulseiras.length > 0 ? t('dashboard.today') : t('dashboard.never')}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}