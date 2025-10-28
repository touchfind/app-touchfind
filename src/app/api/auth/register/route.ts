import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase';
import { hashPassword, getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário atual é admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.tipo !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem registrar usuários.' },
        { status: 403 }
      );
    }

    const { nome, email, senha, tipo } = await request.json();

    // Validações
    if (!nome || !email || !senha || !tipo) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    if (!['admin', 'parceiro', 'cliente'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de usuário inválido.' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await hashPassword(senha);

    // Criar usuário no Supabase
    const supabase = createServiceSupabaseClient();
    const { data: user, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nome,
          email,
          senha: hashedPassword,
          tipo
        }
      ])
      .select('id, nome, email, tipo')
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Email já está em uso.' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      message: 'Usuário criado com sucesso.',
      user
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}