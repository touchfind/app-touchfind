import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseClient } from '@/lib/supabase';

// PATCH /api/admin/pulseiras/[id]/atribuir - Atribuir pulseira a cliente
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.tipo !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = params;
    const { cliente_id } = await request.json();

    if (!cliente_id) {
      return NextResponse.json({ error: 'ID do cliente é obrigatório' }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    // Verificar se pulseira existe e está disponível
    const { data: pulseira } = await supabase
      .from('pulseiras')
      .select('id, cliente_id')
      .eq('id', id)
      .single();

    if (!pulseira) {
      return NextResponse.json({ error: 'Pulseira não encontrada' }, { status: 404 });
    }

    if (pulseira.cliente_id) {
      return NextResponse.json({ error: 'Pulseira já está atribuída' }, { status: 400 });
    }

    // Verificar se cliente existe e é do tipo 'cliente'
    const { data: cliente } = await supabase
      .from('usuarios')
      .select('id, tipo')
      .eq('id', cliente_id)
      .eq('tipo', 'cliente')
      .single();

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado ou inválido' }, { status: 404 });
    }

    // Atribuir pulseira
    const { data: pulseiraAtualizada, error } = await supabase
      .from('pulseiras')
      .update({ cliente_id })
      .eq('id', id)
      .select(`
        id,
        identificador,
        cliente_id,
        created_at,
        cliente:usuarios(id, nome, email)
      `)
      .single();

    if (error) {
      console.error('Erro ao atribuir pulseira:', error);
      return NextResponse.json({ error: 'Erro ao atribuir pulseira' }, { status: 500 });
    }

    return NextResponse.json({ pulseira: pulseiraAtualizada });
  } catch (error) {
    console.error('Erro ao atribuir pulseira:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}