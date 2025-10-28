import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { PulseiraModel } from '@/lib/models/pulseira';
import { PulseiraDadosSosModel } from '@/lib/models/pulseira-dados-sos';
import { SosCampoModel } from '@/lib/models/sos-campo';

export async function GET(
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

    // Buscar pulseira
    const pulseira = await PulseiraModel.findById(id);
    
    if (!pulseira) {
      return NextResponse.json({ error: 'Pulseira não encontrada' }, { status: 404 });
    }

    // Verificar se a pulseira pertence ao cliente
    if (pulseira.cliente_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar dados SOS
    const dadosSos = await PulseiraDadosSosModel.findByPulseiraId(id);

    // Buscar campos personalizados
    const camposPersonalizados = await SosCampoModel.findByPulseiraId(id);

    return NextResponse.json({
      pulseira,
      dadosSos,
      camposPersonalizados
    });
  } catch (error) {
    console.error('Erro ao buscar pulseira:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PATCH(
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

    // Atualizar dados SOS
    const dadosSos = await PulseiraDadosSosModel.update(id, body);

    if (!dadosSos) {
      return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 });
    }

    return NextResponse.json({ dadosSos });
  } catch (error) {
    console.error('Erro ao atualizar pulseira:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}