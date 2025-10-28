import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/auth';

/**
 * Criar cliente Supabase com service role para operações administrativas
 */
function createServiceSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Faltam variáveis NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.tipo !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado - apenas administradores' },
        { status: 403 }
      );
    }

    // Usar service role para ver todos os dados (admin)
    const supabase = createServiceSupabaseClient();

    const { data: pulseiras, error } = await supabase
      .from('pulseiras')
      .select(`
        *,
        usuarios!inner(nome, email, tipo)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ pulseiras });

  } catch (error) {
    console.error('Erro ao buscar todas as pulseiras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.tipo !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado - apenas administradores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { identificador, nome, telefone, endereco, informacoes_medicas, usuario_id } = body;

    if (!identificador || !nome || !usuario_id) {
      return NextResponse.json(
        { error: 'Identificador, nome e usuário são obrigatórios' },
        { status: 400 }
      );
    }

    // Usar service role para criar pulseira para qualquer usuário (admin)
    const supabase = createServiceSupabaseClient();

    const { data: pulseira, error } = await supabase
      .from('pulseiras')
      .insert({
        identificador,
        nome,
        telefone,
        endereco,
        informacoes_medicas,
        usuario_id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ pulseira });

  } catch (error) {
    console.error('Erro ao criar pulseira (admin):', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}