// Rótulos pt-BR e formatadores do dashboard Tráfego (Analytics 2.0).
// A camada de dados devolve os enums crus da API — a tradução é daqui.

export const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR').format(Math.round(v))

export const fmtMoeda = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export const fmtPct = (v: number) => `${v.toFixed(2).replace('.', ',')}%`

/** Conversões fracionadas (atribuição data-driven): 1 casa quando não inteiro. */
export const fmtConv = (v: number) =>
  Number.isInteger(v) ? fmtNum(v) : v.toFixed(1).replace('.', ',')

export const FAIXA_LABEL: Record<string, string> = {
  AGE_RANGE_18_24: '18–24',
  AGE_RANGE_25_34: '25–34',
  AGE_RANGE_35_44: '35–44',
  AGE_RANGE_45_54: '45–54',
  AGE_RANGE_55_64: '55–64',
  AGE_RANGE_65_UP: '65+',
  AGE_RANGE_UNDETERMINED: 'Indeterminado',
}

export const GENERO_LABEL: Record<string, string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
  UNDETERMINED: 'Indeterminado',
}

export const DISPOSITIVO_LABEL: Record<string, string> = {
  MOBILE: 'Celular',
  DESKTOP: 'Computador',
  TABLET: 'Tablet',
  CONNECTED_TV: 'TV conectada',
  OTHER: 'Outros',
  UNKNOWN: 'Desconhecido',
}

export const DIA_CURTO: Record<string, string> = {
  MONDAY: 'Seg', TUESDAY: 'Ter', WEDNESDAY: 'Qua', THURSDAY: 'Qui',
  FRIDAY: 'Sex', SATURDAY: 'Sáb', SUNDAY: 'Dom',
}

export const TIPO_GEO_LABEL: Record<string, string> = {
  'City': 'Cidade',
  'Neighborhood': 'Bairro',
  'Postal Code': 'CEP',
  'State': 'Estado',
  'Region': 'Região',
  'Municipality': 'Município',
  'Country': 'País',
  'County': 'Condado',
  'District': 'Distrito',
}

/** Nome exibível de um local do Ads (CEP ganha prefixo para não parecer número solto). */
export function nomeLocal(local: string, tipo: string): string {
  return tipo === 'Postal Code' ? `CEP ${local}` : local
}
