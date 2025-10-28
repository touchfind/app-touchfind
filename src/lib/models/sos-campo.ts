import { createSupabaseClient } from '../supabase';
import type { 
  SosCampo, 
  CreateSosCampo, 
  UpdateSosCampo,
  SosCampoComPulseira 
} from '../types/database';

const supabase = createSupabaseClient();

export class SosCampoModel {
  // Criar novo campo SOS
  static async create(data: CreateSosCampo): Promise<SosCampo | null> {
    try {
      const { data: campo, error } = await supabase
        .from('sos_campos')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return campo;
    } catch (error) {
      console.error('Erro ao criar campo SOS:', error);
      return null;
    }
  }

  // Buscar campo SOS por ID
  static async findById(id: string): Promise<SosCampo | null> {
    try {
      const { data: campo, error } = await supabase
        .from('sos_campos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return campo;
    } catch (error) {
      console.error('Erro ao buscar campo SOS:', error);
      return null;
    }
  }

  // Buscar campo SOS com dados da pulseira
  static async findByIdWithPulseira(id: string): Promise<SosCampoComPulseira | null> {
    try {
      const { data: campo, error } = await supabase
        .from('sos_campos')
        .select(`
          *,
          pulseira:pulseiras(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return campo;
    } catch (error) {
      console.error('Erro ao buscar campo SOS com pulseira:', error);
      return null;
    }
  }

  // Listar campos SOS de uma pulseira
  static async findByPulseiraId(pulseiraId: string): Promise<SosCampo[]> {
    try {
      const { data: campos, error } = await supabase
        .from('sos_campos')
        .select('*')
        .eq('pulseira_id', pulseiraId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return campos || [];
    } catch (error) {
      console.error('Erro ao buscar campos SOS da pulseira:', error);
      return [];
    }
  }

  // Atualizar campo SOS
  static async update(id: string, data: UpdateSosCampo): Promise<SosCampo | null> {
    try {
      const { data: campo, error } = await supabase
        .from('sos_campos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return campo;
    } catch (error) {
      console.error('Erro ao atualizar campo SOS:', error);
      return null;
    }
  }

  // Criar múltiplos campos SOS
  static async createMultiple(campos: CreateSosCampo[]): Promise<SosCampo[]> {
    try {
      const { data: novosCampos, error } = await supabase
        .from('sos_campos')
        .insert(campos)
        .select();

      if (error) throw error;
      return novosCampos || [];
    } catch (error) {
      console.error('Erro ao criar múltiplos campos SOS:', error);
      return [];
    }
  }

  // Atualizar ordem dos campos
  static async updateOrdem(updates: { id: string; ordem: number }[]): Promise<boolean> {
    try {
      const promises = updates.map(({ id, ordem }) =>
        supabase
          .from('sos_campos')
          .update({ ordem })
          .eq('id', id)
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar ordem dos campos:', error);
      return false;
    }
  }

  // Remover campo SOS (usando UPDATE para marcar como inativo se necessário)
  static async remove(id: string): Promise<boolean> {
    try {
      // Como não podemos usar DELETE, vamos marcar como removido
      // Primeiro, vamos verificar se existe uma coluna 'ativo'
      const { error } = await supabase
        .from('sos_campos')
        .update({ rotulo: '[REMOVIDO]', valor: '' })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover campo SOS:', error);
      return false;
    }
  }

  // Contar campos de uma pulseira
  static async countByPulseira(pulseiraId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('sos_campos')
        .select('*', { count: 'exact', head: true })
        .eq('pulseira_id', pulseiraId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar campos SOS:', error);
      return 0;
    }
  }

  // Buscar próxima ordem disponível para uma pulseira
  static async getNextOrdem(pulseiraId: string): Promise<number> {
    try {
      const { data: campos, error } = await supabase
        .from('sos_campos')
        .select('ordem')
        .eq('pulseira_id', pulseiraId)
        .order('ordem', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (!campos || campos.length === 0) {
        return 1;
      }

      return (campos[0].ordem || 0) + 1;
    } catch (error) {
      console.error('Erro ao buscar próxima ordem:', error);
      return 1;
    }
  }
}