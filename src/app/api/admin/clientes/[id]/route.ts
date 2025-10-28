import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseClient } from '@/lib/supabase';

// PATCH /api/admin/clientes/[id] - Editar/bloquear cliente
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
    const body = await request.json();
    const { nome, email, ativo } = body;

    const supabase = createSupabaseClient();

    // Verificar se cliente existe
    const { data: existingCliente } = await supabase
      .from('usuarios')
      .select('id, tipo')
      .eq('id', id)
      .single();

    if (!existingCliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    let updateData: any = {};

    // Se está editando dados básicos
    if (nome !== undefined || email !== undefined) {
      if (nome) updateData.nome = nome;
      if (email) {
        // Verificar se email já existe (exceto o próprio cliente)
        const { data: emailExists } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', email)
          .neq('id', id)
          .single();

        if (emailExists) {
          return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 });
        }
        updateData.email = email;
      }
    }

    // Se está bloqueando/reativando
    if (ativo !== undefined) {
      updateData.tipo = ativo ? 'cliente' : 'bloqueado';
    }

    // Atualizar cliente
    const { data: cliente, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select('id, nome, email, tipo, created_at')
      .single();

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
    }

    return NextResponse.json({ cliente });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}