// Rótulos e formatadores específicos do dashboard Site (GA4).

export const TIPO_USUARIO_LABEL: Record<string, string> = {
  'new': 'Novo',
  'returning': 'Recorrente',
  '(not set)': 'Indefinido',
}

export const DISPOSITIVO_GA4_LABEL: Record<string, string> = {
  mobile: 'Celular',
  desktop: 'Computador',
  tablet: 'Tablet',
  'smart tv': 'Smart TV',
}

/** Duração em segundos → "4m 32s" (abaixo de 1 min: "45s"). */
export function fmtDuracao(segundos: number): string {
  const s = Math.round(segundos)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
}
