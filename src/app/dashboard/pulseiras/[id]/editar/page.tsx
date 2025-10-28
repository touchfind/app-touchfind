'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface PulseiraDados {
  id: string;
  identificador: string;
  cliente_id: string | null;
  created_at: string;
}

interface DadosSos {
  id?: string;
  pulseira_id: string;
  nome?: string;
  foto?: string;
  data_nascimento?: string;
  contactos?: Array<{ prefixo: string; numero: string }>;
  alergias?: string;
  condicoes_saude?: string;
  medicacao_horarios?: string;
  instrucoes_rapidas?: string;
  idiomas_falados?: string;
  observacoes?: string;
}

interface CampoPersonalizado {
  id: string;
  pulseira_id: string;
  rotulo: string;
  valor: string;
  ordem: number;
  created_at: string;
}

export default function EditarPulseiraPage() {
  const params = useParams();
  const router = useRouter();
  const pulseiraId = params.id as string;

  const [pulseira, setPulseira] = useState<PulseiraDados | null>(null);
  const [dadosSos, setDadosSos] = useState<DadosSos>({
    pulseira_id: pulseiraId,
    contactos: []
  });
  const [camposPersonalizados, setCamposPersonalizados] = useState<CampoPersonalizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [novoCampo, setNovoCampo] = useState({ rotulo: '', valor: '' });

  useEffect(() => {
    fetchPulseiraData();
  }, [pulseiraId]);

  const fetchPulseiraData = async () => {
    try {
      const response = await fetch(`/api/me/pulseiras/${pulseiraId}`);
      if (response.ok) {
        const data = await response.json();
        setPulseira(data.pulseira);
        
        if (data.dadosSos) {
          setDadosSos({
            ...data.dadosSos,
            contactos: data.dadosSos.contactos || []
          });
        }
        
        setCamposPersonalizados(data.camposPersonalizados || []);
      } else if (response.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao buscar dados da pulseira:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDadosPadrao = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/me/pulseiras/${pulseiraId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosSos),
      });

      if (response.ok) {
        alert('Dados salvos com sucesso!');
      } else {
        alert('Erro ao salvar dados');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCampoPersonalizado = async () => {
    if (!novoCampo.rotulo || !novoCampo.valor) {
      alert('Preencha o rótulo e o valor');
      return;
    }

    try {
      const response = await fetch(`/api/me/pulseiras/${pulseiraId}/campos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...novoCampo,
          ordem: camposPersonalizados.length
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCamposPersonalizados([...camposPersonalizados, data.campo]);
        setNovoCampo({ rotulo: '', valor: '' });
      } else {
        alert('Erro ao adicionar campo');
      }
    } catch (error) {
      console.error('Erro ao adicionar campo:', error);
      alert('Erro ao adicionar campo');
    }
  };

  const handleUpdateCampoPersonalizado = async (campoId: string, updates: Partial<CampoPersonalizado>) => {
    try {
      const response = await fetch(`/api/me/campos/${campoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setCamposPersonalizados(campos => 
          campos.map(campo => campo.id === campoId ? data.campo : campo)
        );
      } else {
        alert('Erro ao atualizar campo');
      }
    } catch (error) {
      console.error('Erro ao atualizar campo:', error);
      alert('Erro ao atualizar campo');
    }
  };

  const handleDeleteCampoPersonalizado = async (campoId: string) => {
    if (!confirm('Tem certeza que deseja remover este campo?')) return;

    try {
      const response = await fetch(`/api/me/campos/${campoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCamposPersonalizados(campos => 
          campos.filter(campo => campo.id !== campoId)
        );
      } else {
        alert('Erro ao remover campo');
      }
    } catch (error) {
      console.error('Erro ao remover campo:', error);
      alert('Erro ao remover campo');
    }
  };

  const handleAddContacto = () => {
    const novosContactos = [...(dadosSos.contactos || []), { prefixo: '+351', numero: '' }];
    if (novosContactos.length <= 3) {
      setDadosSos({ ...dadosSos, contactos: novosContactos });
    }
  };

  const handleRemoveContacto = (index: number) => {
    const novosContactos = dadosSos.contactos?.filter((_, i) => i !== index) || [];
    setDadosSos({ ...dadosSos, contactos: novosContactos });
  };

  const handleContactoChange = (index: number, field: 'prefixo' | 'numero', value: string) => {
    const novosContactos = [...(dadosSos.contactos || [])];
    novosContactos[index] = { ...novosContactos[index], [field]: value };
    setDadosSos({ ...dadosSos, contactos: novosContactos });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!pulseira) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Pulseira não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar
              </Link>
              <h1 className="text-xl font-semibold">
                Editar SOS - {pulseira.identificador}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/sos/${pulseira.identificador}`}
                target="_blank"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Pré-visualizar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          
          {/* Seção 1: Campos Padrão */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informações Básicas</h2>
              <p className="text-sm text-gray-500">Dados pessoais e de emergência</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={dadosSos.nome || ''}
                    onChange={(e) => setDadosSos({ ...dadosSos, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={dadosSos.data_nascimento || ''}
                    onChange={(e) => setDadosSos({ ...dadosSos, data_nascimento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto (URL)
                </label>
                <input
                  type="url"
                  value={dadosSos.foto || ''}
                  onChange={(e) => setDadosSos({ ...dadosSos, foto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contactos de Emergência (máx. 3)
                  </label>
                  {(dadosSos.contactos?.length || 0) < 3 && (
                    <button
                      onClick={handleAddContacto}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Adicionar
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {dadosSos.contactos?.map((contacto, index) => (
                    <div key={index} className="flex space-x-3">
                      <select
                        value={contacto.prefixo}
                        onChange={(e) => handleContactoChange(index, 'prefixo', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="+351">+351</option>
                        <option value="+34">+34</option>
                        <option value="+33">+33</option>
                        <option value="+49">+49</option>
                        <option value="+44">+44</option>
                      </select>
                      <input
                        type="tel"
                        value={contacto.numero}
                        onChange={(e) => handleContactoChange(index, 'numero', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Número de telefone"
                      />
                      <button
                        onClick={() => handleRemoveContacto(index)}
                        className="text-red-600 hover:text-red-800 px-3 py-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alergias
                  </label>
                  <textarea
                    value={dadosSos.alergias || ''}
                    onChange={(e) => setDadosSos({ ...dadosSos, alergias: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva alergias conhecidas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condições de Saúde
                  </label>
                  <textarea
                    value={dadosSos.condicoes_saude || ''}
                    onChange={(e) => setDadosSos({ ...dadosSos, condicoes_saude: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Condições médicas relevantes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicação e Horários
                </label>
                <textarea
                  value={dadosSos.medicacao_horarios || ''}
                  onChange={(e) => setDadosSos({ ...dadosSos, medicacao_horarios: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Medicamentos e horários de administração"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruções Rápidas
                </label>
                <textarea
                  value={dadosSos.instrucoes_rapidas || ''}
                  onChange={(e) => setDadosSos({ ...dadosSos, instrucoes_rapidas: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instruções importantes para emergências"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idiomas Falados
                  </label>
                  <input
                    type="text"
                    value={dadosSos.idiomas_falados || ''}
                    onChange={(e) => setDadosSos({ ...dadosSos, idiomas_falados: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Português, Inglês, Espanhol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={dadosSos.observacoes || ''}
                    onChange={(e) => setDadosSos({ ...dadosSos, observacoes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Outras informações relevantes"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveDadosPadrao}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium"
                >
                  {saving ? 'Salvando...' : 'Salvar Dados Básicos'}
                </button>
              </div>
            </div>
          </div>

          {/* Seção 2: Campos Personalizados */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Campos Personalizados</h2>
              <p className="text-sm text-gray-500">Adicione informações específicas</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Adicionar novo campo */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={novoCampo.rotulo}
                    onChange={(e) => setNovoCampo({ ...novoCampo, rotulo: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rótulo do campo (ex: Grupo Sanguíneo)"
                  />
                  <input
                    type="text"
                    value={novoCampo.valor}
                    onChange={(e) => setNovoCampo({ ...novoCampo, valor: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Valor (ex: O+)"
                  />
                </div>
                <button
                  onClick={handleAddCampoPersonalizado}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  + Adicionar Campo
                </button>
              </div>

              {/* Lista de campos existentes */}
              <div className="space-y-4">
                {camposPersonalizados.map((campo, index) => (
                  <div key={campo.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <input
                        type="text"
                        value={campo.rotulo}
                        onChange={(e) => handleUpdateCampoPersonalizado(campo.id, { rotulo: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Rótulo"
                      />
                      <input
                        type="text"
                        value={campo.valor}
                        onChange={(e) => handleUpdateCampoPersonalizado(campo.id, { valor: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Valor"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Ordem: {index + 1}</span>
                      <button
                        onClick={() => handleDeleteCampoPersonalizado(campo.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {camposPersonalizados.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum campo personalizado adicionado ainda.</p>
                  <p className="text-sm">Use o formulário acima para adicionar campos específicos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}