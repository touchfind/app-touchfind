import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { PulseiraModel } from '@/lib/models/pulseira';
import { SosCampoModel } from '@/lib/models/sos-campo';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (user.tipo !== 'cliente') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    // Buscar pulseira
    const pulseira = await PulseiraModel.findById(id);
    
    if (!pulseira) {
      return NextResponse.json({ error: 'Pulseira não encontrada' }, { status: 404 });
    }

    // Verificar se a pulseira pertence ao cliente
    if (pulseira.cliente_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Criar campo personalizado
    const campo = await SosCampoModel.create({
      pulseira_id: id,
      rotulo: body.rotulo,
      valor: body.valor,
      ordem: body.ordem || 0
    });

    if (!campo) {
      return NextResponse.json({ error: 'Erro ao criar campo' }, { status: 500 });
    }

    return NextResponse.json({ campo });
  } catch (error) {
    console.error('Erro ao criar campo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}