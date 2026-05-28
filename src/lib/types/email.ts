export type EmailStatus = 'sent' | 'failed' | 'bounced' | 'pending'

export type EmailTemplateId =
  | 'report-google-ads'
  | 'report-ga4'
  | 'report-executive'
  | 'welcome'
  | 'payment-reminder'
  | 'alert-saldo-baixo'
  | 'alert-performance'

export interface EmailHistory {
  id: string
  user_id: string
  cliente_id?: string
  template_id: string
  destinatario: string
  assunto: string
  status: EmailStatus
  resend_id?: string
  metadata: Record<string, unknown>
  enviado_em: string
}

export interface EmailSendPayload {
  cliente_id?: string
  template_id: EmailTemplateId
  destinatario: string
  assunto: string
  variables?: Record<string, string>
  cc?: string[]
}

export interface EmailTemplate {
  id: EmailTemplateId
  name: string
  description: string
  subject_template: string
  html_template: string
  variables: string[] // list of {{variable}} names used
}
