import { createSupabaseClient } from '../supabase';
import type { 
  Pulseira, 
  CreatePulseira, 
  UpdatePulseira, 
  PulseiraComCliente,
  PulseiraCompleta 
} from '../types/database';

const supabase = createSupabaseClient();

export class PulseiraModel {
  // Criar nova pulseira
  static async create(data: CreatePulseira): Promise<Pulseira | null> {
    try {
      const { data: pulseira, error } = await supabase
        .from('pulseiras')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return pulseira;
    } catch (error) {
      console.error('Erro ao criar pulseira:', error);
      return null;
    }
  }

  // Buscar pulseira por ID
  static async findById(id: string): Promise<Pulseira | null> {
    try {
      const { data: pulseira, error } = await supabase
        .from('pulseiras')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return pulseira;
    } catch (error) {
      console.error('Erro ao buscar pulseira:', error);
      return null;
    }
  }

  // Buscar pulseira por identificador
  static async findByIdentificador(identificador: string): Promise<Pulseira | null> {
    try {
      const { data: pulseira, error } = await supabase
        .from('pulseiras')
        .select('*')
        .eq('identificador', identificador)
        .single();

      if (error) throw error;
      return pulseira;
    } catch (error) {
      console.error('Erro ao buscar pulseira por identificador:', error);
      return null;
    }
  }

  // Buscar pulseira com dados do cliente
  static async findByIdWithCliente(id: string): Promise<PulseiraComCliente | null> {
    try {
      const { data: pulseira, error } = await supabase
        .from('pulseiras')
        .select(`
          *,
          cliente:usuarios(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return pulseira;
    } catch (error) {
      console.error('Erro ao buscar pulseira com cliente:', error);
      return null;
    }
  }

  // Buscar pulseira completa (com cliente e campos SOS)
  static async findCompleta(id: string): Promise<PulseiraCompleta | null> {
    try {
      const { data: pulseira, error } = await supabase
        .from('pulseiras')
        .select(`
          *,
          cliente:usuarios(*),
          sos_campos(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return pulseira;
    } catch (error) {
      console.error('Erro ao buscar pulseira completa:', error);
      return null;
    }
  }

  // Listar todas as pulseiras
  static async findAll(): Promise<Pulseira[]> {
    try {
      const { data: pulseiras, error } = await supabase
        .from('pulseiras')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return pulseiras || [];
    } catch (error) {
      console.error('Erro ao listar pulseiras:', error);
      return [];
    }
  }

  // Listar pulseiras de um cliente
  static async findByClienteId(clienteId: string): Promise<Pulseira[]> {
    try {
      const { data: pulseiras, error } = await supabase
        .from('pulseiras')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return pulseiras || [];
    } catch (error) {
      console.error('Erro ao buscar pulseiras do cliente:', error);
      return [];
    }
  }

  // Atualizar pulseira
  static async update(id: string, data: UpdatePulseira): Promise<Pulseira | null> {
    try {
      const { data: pulseira, error } = await supabase
        .from('pulseiras')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return pulseira;
    } catch (error) {
      console.error('Erro ao atualizar pulseira:', error);
      return null;
    }
  }

  // Associar pulseira a um cliente
  static async associarCliente(id: string, clienteId: string | null): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pulseiras')
        .update({ cliente_id: clienteId })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao associar cliente à pulseira:', error);
      return false;
    }
  }

  // Contar total de pulseiras
  static async count(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('pulseiras')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar pulseiras:', error);
      return 0;
    }
  }
}