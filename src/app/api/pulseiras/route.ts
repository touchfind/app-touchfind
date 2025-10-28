import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();

    // Verificar se usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar pulseiras do usuário (RLS ativo - só vê as próprias)
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
    console.error('Erro ao buscar pulseiras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer();

    // Verificar se usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { identificador, nome, telefone, endereco, informacoes_medicas } = body;

    if (!identificador || !nome) {
      return NextResponse.json(
        { error: 'Identificador e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Criar pulseira (RLS ativo - só pode criar para si mesmo)
    const { data: pulseira, error } = await supabase
      .from('pulseiras')
      .insert({
        identificador,
        nome,
        telefone,
        endereco,
        informacoes_medicas,
        usuario_id: userData.id
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
    console.error('Erro ao criar pulseira:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}