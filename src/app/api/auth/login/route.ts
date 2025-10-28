import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { generateToken, comparePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Validar utilizador no Supabase Auth (por email)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, message: 'Erro no login' },
        { status: 401 }
      );
    }

    // Ler o registo na tabela usuarios para obter o campo tipo
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, tipo, password_hash')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, message: 'Utilizador não encontrado' },
        { status: 401 }
      );
    }

    // Verificar a password (bcrypt.compare) se existir hash armazenado
    if (userData.password_hash) {
      const isPasswordValid = await comparePassword(password, userData.password_hash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Credenciais inválidas' },
          { status: 401 }
        );
      }
    }

    // Gerar JWT com payload { userId, email, tipo } e exp (2h)
    const token = generateToken({
      userId: userData.id,
      email: userData.email,
      tipo: userData.tipo
    });

    // Definir cookie HTTP-only, Secure, SameSite=Lax, nome: auth-token
    const response = NextResponse.json({
      success: true,
      role: userData.tipo
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60, // 2 horas
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}