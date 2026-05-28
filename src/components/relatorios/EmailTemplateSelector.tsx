'use client'

import { cn } from '@/lib/utils'
import type { EmailTemplateId } from '@/lib/types/email'

interface Template {
  id: EmailTemplateId
  name: string
  description: string
}

const TEMPLATES: Template[] = [
  { id: 'report-google-ads', name: 'Relatório Google Ads', description: 'Envio mensal de relatório de campanhas' },
  { id: 'report-ga4', name: 'Relatório Google Analytics', description: 'Envio mensal de análise de site' },
  { id: 'welcome', name: 'Boas-Vindas', description: 'Email de boas-vindas ao novo cliente' },
  { id: 'payment-reminder', name: 'Lembrete de Pagamento', description: 'Cobrança de mensalidade pendente' },
  { id: 'alert-saldo-baixo', name: 'Alerta: Saldo Baixo', description: 'Notificação de saldo Google Ads' },
  { id: 'alert-performance', name: 'Alerta: Performance', description: 'Notificação de variação de métricas' },
]

interface EmailTemplateSelectorProps {
  value: EmailTemplateId | null
  onChange: (id: EmailTemplateId) => void
}

export function EmailTemplateSelector({ value, onChange }: EmailTemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.5rem]">
      {TEMPLATES.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'text-left p-[0.75rem] rounded-xl border transition-all',
            value === t.id
              ? 'border-ads-500 bg-ads-500/10'
              : 'border-surface-border bg-surface-hover hover:border-ads-500/40'
          )}
        >
          <p className={cn('text-[0.8125rem] font-semibold', value === t.id ? 'text-ads-500' : 'text-ink-primary')}>
            {t.name}
          </p>
          <p className="text-[0.6875rem] text-ink-muted mt-[0.125rem]">{t.description}</p>
        </button>
      ))}
    </div>
  )
}
