import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { PulseiraModel } from '@/lib/models/pulseira';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (user.tipo !== 'cliente') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar pulseiras do cliente
    const pulseiras = await PulseiraModel.findByClienteId(user.id);

    return NextResponse.json({ pulseiras });
  } catch (error) {
    console.error('Erro ao buscar pulseiras:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}