'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { TemplatesEmail } from '@/components/configuracoes/TemplatesEmail'

export default function EmailTemplatesPage() {
  return (
    <MainLayout
      title="Templates de Email"
      subtitle="Edite o assunto e o HTML de cada email. Sem edição, usa o template padrão."
    >
      <div className="page-enter">
        <TemplatesEmail />
      </div>
    </MainLayout>
  )
}
