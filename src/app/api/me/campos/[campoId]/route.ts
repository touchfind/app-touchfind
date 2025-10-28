import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { SosCampoModel } from '@/lib/models/sos-campo';
import { PulseiraModel } from '@/lib/models/pulseira';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { campoId: string } }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (user.tipo !== 'cliente') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { campoId } = params;
    const body = await request.json();

    // Buscar campo
    const campo = await SosCampoModel.findById(campoId);
    
    if (!campo) {
      return NextResponse.json({ error: 'Campo não encontrado' }, { status: 404 });
    }

    // Verificar se a pulseira pertence ao cliente
    const pulseira = await PulseiraModel.findById(campo.pulseira_id);
    
    if (!pulseira || pulseira.cliente_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Atualizar campo
    const campoAtualizado = await SosCampoModel.update(campoId, body);

    if (!campoAtualizado) {
      return NextResponse.json({ error: 'Erro ao atualizar campo' }, { status: 500 });
    }

    return NextResponse.json({ campo: campoAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar campo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { campoId: string } }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (user.tipo !== 'cliente') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { campoId } = params;

    // Buscar campo
    const campo = await SosCampoModel.findById(campoId);
    
    if (!campo) {
      return NextResponse.json({ error: 'Campo não encontrado' }, { status: 404 });
    }

    // Verificar se a pulseira pertence ao cliente
    const pulseira = await PulseiraModel.findById(campo.pulseira_id);
    
    if (!pulseira || pulseira.cliente_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Deletar campo
    const sucesso = await SosCampoModel.delete(campoId);

    if (!sucesso) {
      return NextResponse.json({ error: 'Erro ao deletar campo' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Campo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar campo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}