import { NextResponse } from 'next/server'
import { checkAllIntegrations } from '@/lib/integration-status'

// Wrapper fino — a lógica dos checks vive em lib/integration-status.ts
// (reutilizada pelo setup-checklist e pela tool prontidao_sistema da Gator).
export async function GET(request: Request) {
  const fresh = new URL(request.url).searchParams.get('fresh') === '1'
  const status = await checkAllIntegrations({ fresh })
  return NextResponse.json(status)
}
