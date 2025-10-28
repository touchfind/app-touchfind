import { PulseiraModel } from './models/pulseira';
import { SosCampoModel } from './models/sos-campo';
import type { CreatePulseira, CreateSosCampo } from './types/database';

// Utilitários para operações comuns com pulseiras e campos SOS

export class PulseiraService {
  // Criar pulseira com campos SOS iniciais
  static async createWithSosCampos(
    pulseiraData: CreatePulseira,
    sosCampos: Omit<CreateSosCampo, 'pulseira_id'>[] = []
  ) {
    try {
      // Criar a pulseira
      const pulseira = await PulseiraModel.create(pulseiraData);
      if (!pulseira) {
        throw new Error('Falha ao criar pulseira');
      }

      // Criar campos SOS se fornecidos
      if (sosCampos.length > 0) {
        const camposComPulseiraId = sosCampos.map((campo, index) => ({
          ...campo,
          pulseira_id: pulseira.id,
          ordem: campo.ordem || index + 1
        }));

        const camposCriados = await SosCampoModel.createMultiple(camposComPulseiraId);
        
        return {
          pulseira,
          sos_campos: camposCriados
        };
      }

      return { pulseira, sos_campos: [] };
    } catch (error) {
      console.error('Erro ao criar pulseira com campos SOS:', error);
      throw error;
    }
  }

  // Buscar pulseira por identificador com todos os dados
  static async findByIdentificadorCompleta(identificador: string) {
    try {
      const pulseira = await PulseiraModel.findByIdentificador(identificador);
      if (!pulseira) return null;

      const pulseiraCompleta = await PulseiraModel.findCompleta(pulseira.id);
      return pulseiraCompleta;
    } catch (error) {
      console.error('Erro ao buscar pulseira completa por identificador:', error);
      return null;
    }
  }

  // Adicionar campo SOS a uma pulseira
  static async addSosCampo(
    pulseiraId: string,
    campoData: Omit<CreateSosCampo, 'pulseira_id' | 'ordem'>
  ) {
    try {
      const proximaOrdem = await SosCampoModel.getNextOrdem(pulseiraId);
      
      const novoCampo = await SosCampoModel.create({
        ...campoData,
        pulseira_id: pulseiraId,
        ordem: proximaOrdem
      });

      return novoCampo;
    } catch (error) {
      console.error('Erro ao adicionar campo SOS:', error);
      throw error;
    }
  }

  // Reordenar campos SOS de uma pulseira
  static async reorderSosCampos(
    pulseiraId: string,
    camposOrdenados: { id: string; ordem: number }[]
  ) {
    try {
      const sucesso = await SosCampoModel.updateOrdem(camposOrdenados);
      return sucesso;
    } catch (error) {
      console.error('Erro ao reordenar campos SOS:', error);
      return false;
    }
  }

  // Estatísticas gerais
  static async getEstatisticas() {
    try {
      const totalPulseiras = await PulseiraModel.count();
      
      // Buscar pulseiras com clientes associados
      const pulseirasComCliente = await PulseiraModel.findAll();
      const pulseirasSemCliente = pulseirasComCliente.filter(p => !p.cliente_id);
      const pulseirasAssociadas = pulseirasComCliente.filter(p => p.cliente_id);

      return {
        total_pulseiras: totalPulseiras,
        pulseiras_associadas: pulseirasAssociadas.length,
        pulseiras_sem_cliente: pulseirasSemCliente.length
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total_pulseiras: 0,
        pulseiras_associadas: 0,
        pulseiras_sem_cliente: 0
      };
    }
  }
}

// Validadores
export class PulseiraValidator {
  static isValidIdentificador(identificador: string): boolean {
    // Identificador deve ter pelo menos 3 caracteres e ser alfanumérico
    return /^[a-zA-Z0-9]{3,}$/.test(identificador);
  }

  static isValidSosCampo(campo: Omit<CreateSosCampo, 'pulseira_id'>): boolean {
    return (
      campo.rotulo.trim().length > 0 &&
      campo.valor.trim().length > 0 &&
      (campo.ordem === undefined || campo.ordem >= 0)
    );
  }
}

// Geradores de dados de exemplo
export class PulseiraSeeder {
  static async createSampleData() {
    try {
      // Criar algumas pulseiras de exemplo
      const pulseiras = [
        {
          identificador: 'PUL001',
          cliente_id: null
        },
        {
          identificador: 'PUL002',
          cliente_id: null
        }
      ];

      const pulseirasCreated = [];
      
      for (const pulseiraData of pulseiras) {
        const pulseira = await PulseiraModel.create(pulseiraData);
        if (pulseira) {
          pulseirasCreated.push(pulseira);

          // Adicionar campos SOS de exemplo
          const camposExemplo = [
            { rotulo: 'Nome', valor: 'João Silva', ordem: 1 },
            { rotulo: 'Telefone', valor: '+351 912 345 678', ordem: 2 },
            { rotulo: 'Condição Médica', valor: 'Diabetes', ordem: 3 }
          ];

          for (const campo of camposExemplo) {
            await SosCampoModel.create({
              ...campo,
              pulseira_id: pulseira.id
            });
          }
        }
      }

      return pulseirasCreated;
    } catch (error) {
      console.error('Erro ao criar dados de exemplo:', error);
      return [];
    }
  }
}