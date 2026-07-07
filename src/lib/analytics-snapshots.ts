// Helpers puros sobre analytics_snapshots — sem SDKs Google, importável
// também em componentes client (analytics-sync.ts puxa os SDKs Node).
//
// O sync grava DOIS períodos por fonte: o mês (snapshot mensal) e a última
// semana completa seg–dom (snapshot semanal, base do relatório semanal).
// Leitores que comparam/exibem histórico precisam separar os dois — misturar
// mês com semana gera variação absurda.

/** Snapshot semanal = período de exatamente 7 dias (seg–dom). */
export function ehSnapshotSemanal(periodoInicio: string, periodoFim: string): boolean {
  const dias = Math.round(
    (new Date(`${periodoFim}T12:00:00`).getTime() - new Date(`${periodoInicio}T12:00:00`).getTime()) / 86_400_000,
  )
  return dias === 6
}
