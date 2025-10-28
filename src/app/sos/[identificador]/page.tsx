'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageToggle from '@/components/LanguageToggle';

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

export default function SosPage() {
  const params = useParams();
  const identificador = params.identificador as string;
  const t = useTranslations();

  const [pulseira, setPulseira] = useState<PulseiraDados | null>(null);
  const [dadosSos, setDadosSos] = useState<DadosSos | null>(null);
  const [camposPersonalizados, setCamposPersonalizados] = useState<CampoPersonalizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSosData();
  }, [identificador]);

  const fetchSosData = async () => {
    try {
      const response = await fetch(`/api/sos/${identificador}`);
      if (response.ok) {
        const data = await response.json();
        setPulseira(data.pulseira);
        setDadosSos(data.dadosSos);
        setCamposPersonalizados(data.camposPersonalizados || []);
      } else if (response.status === 404) {
        setError(t('sos.braceletNotFound'));
      } else {
        setError('Erro ao carregar dados');
      }
    } catch (error) {
      console.error('Erro ao buscar dados SOS:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-700">{t('sos.loadingEmergencyInfo')}</div>
        </div>
      </div>
    );
  }

  if (error || !pulseira) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="text-6xl text-red-600 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || t('sos.braceletNotFound')}
          </h1>
          <p className="text-gray-600 mb-4">
            {t('sos.checkCodeAndTryAgain')}
          </p>
          <div className="mt-4">
            <LanguageToggle variant="link" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50">
      {/* Header de Emergência */}
      <div className="bg-red-600 text-white py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-4xl mb-2">🚨</div>
          <h1 className="text-3xl font-bold mb-2">{t('sos.title')}</h1>
          <p className="text-red-100">{t('sos.bracelet')}: {pulseira.identificador}</p>
          <div className="mt-4">
            <LanguageToggle variant="link" className="text-red-100 hover:text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Informações Pessoais */}
        {dadosSos && (
          <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">{t('sos.personalInfo')}</h2>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {dadosSos.foto && (
                  <div className="flex-shrink-0">
                    <img
                      src={dadosSos.foto}
                      alt="Foto"
                      className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
                
                <div className="flex-1 space-y-4">
                  {dadosSos.nome && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{dadosSos.nome}</h3>
                    </div>
                  )}
                  
                  {dadosSos.data_nascimento && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">{t('sos.birthDateAge')}:</span>
                      <p className="text-lg text-gray-900">
                        {formatDate(dadosSos.data_nascimento)} ({calculateAge(dadosSos.data_nascimento)} {t('sos.years')})
                      </p>
                    </div>
                  )}
                  
                  {dadosSos.idiomas_falados && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">{t('sos.languages')}:</span>
                      <p className="text-lg text-gray-900">{dadosSos.idiomas_falados}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contactos de Emergência */}
        {dadosSos?.contactos && dadosSos.contactos.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
            <div className="bg-red-100 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-red-800">📞 {t('sos.emergencyContacts')}</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dadosSos.contactos.map((contacto, index) => (
                  <div key={index} className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-sm font-medium text-red-600 mb-1">
                      {t('sos.contact')} {index + 1}
                    </div>
                    <a
                      href={`tel:${contacto.prefixo}${contacto.numero}`}
                      className="text-2xl font-bold text-red-800 hover:text-red-900 block"
                    >
                      {contacto.prefixo} {contacto.numero}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instruções Rápidas */}
        {dadosSos?.instrucoes_rapidas && (
          <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
            <div className="bg-yellow-100 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-yellow-800">⚡ {t('sos.quickInstructions')}</h2>
            </div>
            
            <div className="p-6">
              <p className="text-lg text-gray-900 whitespace-pre-wrap">{dadosSos.instrucoes_rapidas}</p>
            </div>
          </div>
        )}

        {/* Informações Médicas */}
        {(dadosSos?.alergias || dadosSos?.condicoes_saude || dadosSos?.medicacao_horarios) && (
          <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
            <div className="bg-blue-100 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-blue-800">🏥 {t('sos.medicalInfo')}</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {dadosSos.alergias && (
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-2">⚠️ {t('sos.allergies')}</h3>
                  <p className="text-gray-900 whitespace-pre-wrap bg-red-50 p-3 rounded-lg">{dadosSos.alergias}</p>
                </div>
              )}
              
              {dadosSos.condicoes_saude && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">🩺 {t('sos.healthConditions')}</h3>
                  <p className="text-gray-900 whitespace-pre-wrap bg-blue-50 p-3 rounded-lg">{dadosSos.condicoes_saude}</p>
                </div>
              )}
              
              {dadosSos.medicacao_horarios && (
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">💊 {t('sos.medicationSchedules')}</h3>
                  <p className="text-gray-900 whitespace-pre-wrap bg-green-50 p-3 rounded-lg">{dadosSos.medicacao_horarios}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Campos Personalizados */}
        {camposPersonalizados.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
            <div className="bg-purple-100 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-purple-800">📋 {t('sos.additionalInfo')}</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {camposPersonalizados
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((campo) => (
                    <div key={campo.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        {campo.rotulo}
                      </div>
                      <div className="text-lg text-gray-900">
                        {campo.valor}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        {dadosSos?.observacoes && (
          <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">📝 {t('sos.observations')}</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-900 whitespace-pre-wrap">{dadosSos.observacoes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <div className="text-sm text-gray-500">
            <p>{t('sos.emergencyNumber')}</p>
            <p className="mt-2">{t('sos.systemName')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}