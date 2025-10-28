import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();

    // Obter sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar dados do usuário na tabela usuarios (com RLS ativo)
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo, auth_user_id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo
      },
      session
    });

  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}