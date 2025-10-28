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

    // Usar service role para ver todos os usuários (admin)
    const supabase = createServiceSupabaseClient();

    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo, auth_user_id, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ usuarios });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
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
    const { email, nome, tipo, senha } = body;

    if (!email || !nome || !tipo || !senha) {
      return NextResponse.json(
        { error: 'Email, nome, tipo e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Usar service role para criar usuário no Supabase Auth
    const supabase = createServiceSupabaseClient();

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      user_metadata: { name: nome }
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário no Auth' },
        { status: 400 }
      );
    }

    // Criar usuário na tabela usuarios
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .insert({
        auth_user_id: authData.user.id,
        email,
        nome,
        tipo
      })
      .select()
      .single();

    if (userError) {
      // Se falhar, tentar deletar o usuário do Auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: userError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ usuario });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}