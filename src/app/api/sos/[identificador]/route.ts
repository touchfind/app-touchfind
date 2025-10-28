import { NextRequest, NextResponse } from 'next/server';
import { PulseiraModel } from '@/lib/models/pulseira';
import { PulseiraDadosSosModel } from '@/lib/models/pulseira-dados-sos';
import { SosCampoModel } from '@/lib/models/sos-campo';

export async function GET(
  request: NextRequest,
  { params }: { params: { identificador: string } }
) {
  try {
    const { identificador } = params;

    // Buscar pulseira pelo identificador
    const pulseira = await PulseiraModel.findByIdentificador(identificador);
    
    if (!pulseira) {
      return NextResponse.json({ error: 'Pulseira não encontrada' }, { status: 404 });
    }

    // Buscar dados SOS
    const dadosSos = await PulseiraDadosSosModel.findByPulseiraId(pulseira.id);

    // Buscar campos personalizados
    const camposPersonalizados = await SosCampoModel.findByPulseiraId(pulseira.id);

    return NextResponse.json({
      pulseira,
      dadosSos,
      camposPersonalizados
    });
  } catch (error) {
    console.error('Erro ao buscar dados SOS:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}