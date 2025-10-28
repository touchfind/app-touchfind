'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Usuario, Pulseira, PulseiraComCliente } from '@/lib/types/database';
import LanguageToggle from '@/components/LanguageToggle';

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: string;
}

interface CreateClienteForm {
  nome: string;
  email: string;
  senha: string;
}

interface EditClienteForm {
  nome: string;
  email: string;
}

interface CreatePulseiraForm {
  identificador: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clientes' | 'pulseiras'>('clientes');
  
  // Estados para clientes
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [clientesLoading, setClientesLoading] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [showCreateClienteModal, setShowCreateClienteModal] = useState(false);
  const [showEditClienteModal, setShowEditClienteModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Usuario | null>(null);
  const [createClienteForm, setCreateClienteForm] = useState<CreateClienteForm>({
    nome: '',
    email: '',
    senha: ''
  });
  const [editClienteForm, setEditClienteForm] = useState<EditClienteForm>({
    nome: '',
    email: ''
  });

  // Estados para pulseiras
  const [pulseiras, setPulseiras] = useState<PulseiraComCliente[]>([]);
  const [pulseirasLoading, setPulseirasLoading] = useState(false);
  const [pulseiraSearch, setPulseiraSearch] = useState('');
  const [showCreatePulseiraModal, setShowCreatePulseiraModal] = useState(false);
  const [showAtribuirModal, setShowAtribuirModal] = useState(false);
  const [showTransferirModal, setShowTransferirModal] = useState(false);
  const [selectedPulseira, setSelectedPulseira] = useState<PulseiraComCliente | null>(null);
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [createPulseiraForm, setCreatePulseiraForm] = useState<CreatePulseiraForm>({
    identificador: ''
  });

  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchClientes();
      fetchPulseiras();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user.tipo !== 'admin') {
          router.push('/pt/login');
          return;
        }
        setUser(data.user);
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

  const fetchClientes = async () => {
    setClientesLoading(true);
    try {
      const response = await fetch('/api/admin/clientes');
      if (response.ok) {
        const data = await response.json();
        setClientes(data.clientes);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setClientesLoading(false);
    }
  };

  const fetchPulseiras = async () => {
    setPulseirasLoading(true);
    try {
      const response = await fetch('/api/admin/pulseiras');
      if (response.ok) {
        const data = await response.json();
        setPulseiras(data.pulseiras);
      }
    } catch (error) {
      console.error('Erro ao buscar pulseiras:', error);
    } finally {
      setPulseirasLoading(false);
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

  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createClienteForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('admin.clientCreatedSuccess'));
        setCreateClienteForm({ nome: '', email: '', senha: '' });
        setShowCreateClienteModal(false);
        fetchClientes();
      } else {
        setMessage(data.error || 'Erro ao criar cliente');
      }
    } catch (error) {
      setMessage('Erro ao criar cliente');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) return;

    setActionLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/clientes/${selectedCliente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editClienteForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('admin.clientUpdatedSuccess'));
        setShowEditClienteModal(false);
        fetchClientes();
      } else {
        setMessage(data.error || 'Erro ao atualizar cliente');
      }
    } catch (error) {
      setMessage('Erro ao atualizar cliente');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleClienteStatus = async (cliente: Usuario) => {
    setActionLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/clientes/${cliente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: cliente.tipo === 'cliente' ? false : true }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(cliente.tipo === 'cliente' ? t('admin.clientBlockedSuccess') : t('admin.clientReactivatedSuccess'));
        fetchClientes();
      } else {
        setMessage(data.error || 'Erro ao alterar status do cliente');
      }
    } catch (error) {
      setMessage('Erro ao alterar status do cliente');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePulseira = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/pulseiras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPulseiraForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('admin.braceletCreatedSuccess'));
        setCreatePulseiraForm({ identificador: '' });
        setShowCreatePulseiraModal(false);
        fetchPulseiras();
      } else {
        setMessage(data.error || 'Erro ao criar pulseira');
      }
    } catch (error) {
      setMessage('Erro ao criar pulseira');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAtribuirPulseira = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPulseira) return;

    setActionLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/pulseiras/${selectedPulseira.id}/atribuir`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: selectedClienteId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('admin.braceletAssignedSuccess'));
        setShowAtribuirModal(false);
        setSelectedClienteId('');
        fetchPulseiras();
      } else {
        setMessage(data.error || 'Erro ao atribuir pulseira');
      }
    } catch (error) {
      setMessage('Erro ao atribuir pulseira');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferirPulseira = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPulseira) return;

    setActionLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/pulseiras/${selectedPulseira.id}/transferir`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novo_cliente_id: selectedClienteId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('admin.braceletTransferredSuccess'));
        setShowTransferirModal(false);
        setSelectedClienteId('');
        fetchPulseiras();
      } else {
        setMessage(data.error || 'Erro ao transferir pulseira');
      }
    } catch (error) {
      setMessage('Erro ao transferir pulseira');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.email.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    cliente.nome.toLowerCase().includes(clienteSearch.toLowerCase())
  );

  const filteredPulseiras = pulseiras.filter(pulseira =>
    pulseira.identificador.toLowerCase().includes(pulseiraSearch.toLowerCase()) ||
    (pulseira.cliente?.email || '').toLowerCase().includes(pulseiraSearch.toLowerCase())
  );

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
              <h1 className="text-xl font-semibold">{t('admin.backoffice')}</h1>
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
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.includes('sucesso') || message.includes('success')
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('clientes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'clientes'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('navigation.clients')}
              </button>
              <button
                onClick={() => setActiveTab('pulseiras')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pulseiras'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('navigation.bracelets')}
              </button>
            </nav>
          </div>

          {/* Tab Clientes */}
          {activeTab === 'clientes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('admin.clientManagement')}</h2>
                <button
                  onClick={() => setShowCreateClienteModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {t('admin.createClient')}
                </button>
              </div>

              {/* Pesquisa */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder={t('admin.searchClients')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                />
              </div>

              {/* Tabela de Clientes */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.email')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientesLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">{t('common.loading')}</td>
                      </tr>
                    ) : filteredClientes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">{t('admin.noClientsFound')}</td>
                      </tr>
                    ) : (
                      filteredClientes.map((cliente) => (
                        <tr key={cliente.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {cliente.nome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cliente.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              cliente.tipo === 'cliente' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {cliente.tipo === 'cliente' ? t('common.active') : t('admin.blocked')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCliente(cliente);
                                setEditClienteForm({ nome: cliente.nome, email: cliente.email });
                                setShowEditClienteModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {t('common.edit')}
                            </button>
                            <button
                              onClick={() => handleToggleClienteStatus(cliente)}
                              disabled={actionLoading}
                              className={`${
                                cliente.tipo === 'cliente' 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              } disabled:opacity-50`}
                            >
                              {cliente.tipo === 'cliente' ? t('admin.block') : t('admin.reactivate')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Pulseiras */}
          {activeTab === 'pulseiras' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('admin.braceletManagement')}</h2>
                <button
                  onClick={() => setShowCreatePulseiraModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {t('admin.createBracelet')}
                </button>
              </div>

              {/* Pesquisa */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder={t('admin.searchBracelets')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={pulseiraSearch}
                  onChange={(e) => setPulseiraSearch(e.target.value)}
                />
              </div>

              {/* Tabela de Pulseiras */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.identifier')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.client')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pulseirasLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">{t('common.loading')}</td>
                      </tr>
                    ) : filteredPulseiras.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">{t('admin.noBraceletsFound')}</td>
                      </tr>
                    ) : (
                      filteredPulseiras.map((pulseira) => (
                        <tr key={pulseira.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pulseira.identificador}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pulseira.cliente ? pulseira.cliente.email : t('admin.notAssigned')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              pulseira.cliente_id 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {pulseira.cliente_id ? t('admin.assigned') : t('admin.available')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {!pulseira.cliente_id ? (
                              <button
                                onClick={() => {
                                  setSelectedPulseira(pulseira);
                                  setShowAtribuirModal(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                {t('admin.assign')}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedPulseira(pulseira);
                                  setShowTransferirModal(true);
                                }}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                {t('admin.transfer')}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Criar Cliente */}
      {showCreateClienteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.createClient')}</h3>
              <form onSubmit={handleCreateCliente} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.name')}</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={createClienteForm.nome}
                    onChange={(e) => setCreateClienteForm({ ...createClienteForm, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.email')}</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={createClienteForm.email}
                    onChange={(e) => setCreateClienteForm({ ...createClienteForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.password')}</label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={createClienteForm.senha}
                    onChange={(e) => setCreateClienteForm({ ...createClienteForm, senha: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateClienteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {actionLoading ? t('admin.creating') : t('common.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {showEditClienteModal && selectedCliente && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.editClient')}</h3>
              <form onSubmit={handleEditCliente} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.name')}</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={editClienteForm.nome}
                    onChange={(e) => setEditClienteForm({ ...editClienteForm, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('common.email')}</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={editClienteForm.email}
                    onChange={(e) => setEditClienteForm({ ...editClienteForm, email: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditClienteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {actionLoading ? t('admin.saving') : t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Pulseira */}
      {showCreatePulseiraModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.createBracelet')}</h3>
              <form onSubmit={handleCreatePulseira} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.identifier')}</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={createPulseiraForm.identificador}
                    onChange={(e) => setCreatePulseiraForm({ ...createPulseiraForm, identificador: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreatePulseiraModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {actionLoading ? t('admin.creating') : t('common.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atribuir Pulseira */}
      {showAtribuirModal && selectedPulseira && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.assignBracelet')}: {selectedPulseira.identificador}
              </h3>
              <form onSubmit={handleAtribuirPulseira} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.client')}</label>
                  <select
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={selectedClienteId}
                    onChange={(e) => setSelectedClienteId(e.target.value)}
                  >
                    <option value="">{t('admin.selectClient')}</option>
                    {clientes.filter(c => c.tipo === 'cliente').map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} ({cliente.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAtribuirModal(false);
                      setSelectedClienteId('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {actionLoading ? t('admin.assigning') : t('admin.assign')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Transferir Pulseira */}
      {showTransferirModal && selectedPulseira && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.transferBracelet')}: {selectedPulseira.identificador}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('admin.currentlyAssignedTo')} {selectedPulseira.cliente?.email}
              </p>
              <form onSubmit={handleTransferirPulseira} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.newClient')}</label>
                  <select
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={selectedClienteId}
                    onChange={(e) => setSelectedClienteId(e.target.value)}
                  >
                    <option value="">{t('admin.selectClient')}</option>
                    {clientes
                      .filter(c => c.tipo === 'cliente' && c.id !== selectedPulseira.cliente_id)
                      .map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome} ({cliente.email})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransferirModal(false);
                      setSelectedClienteId('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {actionLoading ? t('admin.transferring') : t('admin.transfer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}