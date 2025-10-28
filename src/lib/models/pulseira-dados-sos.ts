import { createSupabaseClient } from '../supabase';
import type { 
  PulseiraDadosSos, 
  CreatePulseiraDadosSos, 
  UpdatePulseiraDadosSos 
} from '../types/database';

const supabase = createSupabaseClient();

export class PulseiraDadosSosModel {
  // Criar dados SOS para uma pulseira
  static async create(data: CreatePulseiraDadosSos): Promise<PulseiraDadosSos | null> {
    try {
      const { data: dadosSos, error } = await supabase
        .from('pulseira_dados_sos')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return dadosSos;
    } catch (error) {
      console.error('Erro ao criar dados SOS:', error);
      return null;
    }
  }

  // Buscar dados SOS por pulseira ID
  static async findByPulseiraId(pulseiraId: string): Promise<PulseiraDadosSos | null> {
    try {
      const { data: dadosSos, error } = await supabase
        .from('pulseira_dados_sos')
        .select('*')
        .eq('pulseira_id', pulseiraId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return dadosSos || null;
    } catch (error) {
      console.error('Erro ao buscar dados SOS:', error);
      return null;
    }
  }

  // Atualizar dados SOS
  static async update(pulseiraId: string, data: UpdatePulseiraDadosSos): Promise<PulseiraDadosSos | null> {
    try {
      // Primeiro, verificar se já existem dados
      const existing = await this.findByPulseiraId(pulseiraId);
      
      if (existing) {
        // Atualizar dados existentes
        const { data: dadosSos, error } = await supabase
          .from('pulseira_dados_sos')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('pulseira_id', pulseiraId)
          .select()
          .single();

        if (error) throw error;
        return dadosSos;
      } else {
        // Criar novos dados
        return await this.create({ pulseira_id: pulseiraId, ...data });
      }
    } catch (error) {
      console.error('Erro ao atualizar dados SOS:', error);
      return null;
    }
  }

  // Deletar dados SOS
  static async delete(pulseiraId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pulseira_dados_sos')
        .delete()
        .eq('pulseira_id', pulseiraId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar dados SOS:', error);
      return false;
    }
  }
}