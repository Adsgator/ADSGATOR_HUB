import { NextRequest, NextResponse } from 'next/server';
import { gerarCopyLandingPage } from '@/lib/vertex-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      nomeCliente:  string;
      nicho:        string;
      estilo:       string;
      direcaoArte?: string;
      publicoAlvo?: string;
    };

    if (!body.nomeCliente || !body.nicho) {
      return NextResponse.json({ error: 'nomeCliente e nicho são obrigatórios' }, { status: 400 });
    }

    const copy = await gerarCopyLandingPage(
      body.nomeCliente,
      body.nicho,
      body.estilo ?? 'minimalista',
      body.direcaoArte ?? '',
      body.publicoAlvo,
    );

    return NextResponse.json({ copy });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
