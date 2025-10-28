import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { createSupabaseClient } from '@/lib/supabase';

// GET /api/admin/clientes - Listar clientes
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.tipo !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const supabase = createSupabaseClient();
    const { data: clientes, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo, created_at')
      .eq('tipo', 'cliente')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }

    return NextResponse.json({ clientes });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/admin/clientes - Criar cliente
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.tipo !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { nome, email, senha } = await request.json();

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(senha);

    // Criar cliente
    const { data: cliente, error } = await supabase
      .from('usuarios')
      .insert({
        nome,
        email,
        senha: hashedPassword,
        tipo: 'cliente'
      })
      .select('id, nome, email, tipo, created_at')
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
    }

    return NextResponse.json({ cliente }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}