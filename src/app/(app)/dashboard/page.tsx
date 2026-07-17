'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition, fadeScale } from '@/lib/motion'
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const { Responsive: RGLResponsive } = require('react-grid-layout') as { Responsive: React.ComponentType<any> }
import {
  Users,
  DollarSign,
  Percent,
  CreditCard,
  Download,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  PauseCircle,
  LayoutDashboard,
  Check,
  X,
} from 'lucide-react'
import { MainLayout }            from '@/components/layout/MainLayout'
import { BentoCard }             from '@/components/dashboard/BentoCard'
import { SetupProgressCard }     from '@/components/dashboard/SetupProgressCard'
import { KpiCard }               from '@/components/dashboard/KpiCard'
import { AcoesDoDia }            from '@/components/dashboard/AcoesDoDia'
import { KpiCompactCard }        from '@/components/dashboard/KpiCompactCard'
import { MorningBriefing }       from '@/components/dashboard/MorningBriefing'
import { WeatherClock }          from '@/components/dashboard/WeatherClock'
import { DRESparkline }          from '@/components/dashboard/DRESparkline'
import { AlertasCriticos }       from '@/components/dashboard/AlertasCriticos'
import { GeminiChat }            from '@/components/dashboard/GeminiChat'
import { ActivityFeed }          from '@/components/dashboard/ActivityFeed'
import { NewsContainer }         from '@/components/dashboard/NewsContainer'
import { TimelineCard }          from '@/components/dashboard/TimelineCard'
import { ProximasCobrancas }     from '@/components/dashboard/ProximasCobrancas'
import { ChurnRisk }             from '@/components/dashboard/ChurnRisk'
import { TopPerformers }         from '@/components/dashboard/TopPerformers'
import { CentralDeComando }      from '@/components/dashboard/CentralDeComando'
import { GoalsCard }             from '@/components/dashboard/GoalsCard'
import { AlertaSaldoGoogle }     from '@/components/dashboard/AlertaSaldoGoogle'
import { SaudeDoSistema }        from '@/components/dashboard/SaudeDoSistema'
import { PendenciasModal }       from '@/components/dashboard/PendenciasModal'
import { RecentTransactions }    from '@/components/dashboard/RecentTransactions'
import { OnboardingWizard }      from '@/components/ui/OnboardingWizard'
import { useClientes }           from '@/lib/hooks/useClientes'
import { useRightSidebarStore }  from '@/lib/store/right-sidebar-store'
import { supabase }              from '@/lib/supabase'
import { carregarDashboardLayout, salvarDashboardLayout, type Layouts as LayoutsType } from '@/lib/database'
import { toast } from 'sonner'
import type { Cliente, Estagio } from '@/lib/types'
import { estagioInadimplencia, diasAtrasoCliente } from '@/lib/cobranca'
import { gerarLinkWhatsApp } from '@/lib/whatsapp'

type Urgencia = 'critica' | 'atencao' | 'review'

interface AcaoItem {
  cliente:   Cliente
  estagio:   Estagio | null
  urgencia:  Urgencia
  descricao: string
  acaoLabel: string
  whatsapp?: string
}

const STORAGE_KEY = 'adsgator-bento-layouts-v4'

const CARD_DESCRIPTIONS: Record<string, string> = {
  'kpi-ativos': 'Exibe o total de clientes com status "ativo" no momento. O número é calculado em tempo real a partir do banco de dados. Clique para acessar a lista completa de clientes.',
  'kpi-mrr': 'MRR (Monthly Recurring Revenue) — receita recorrente mensal agregada de todos os clientes ativos. Calculado somando o valor mensal de cada assinatura ativa. Clique para ver o módulo financeiro.',
  'kpi-retencao': 'Taxa de retenção percentual dos clientes: total de ativos dividido pelo total geral de clientes cadastrados. Indica a saúde do portfólio — quanto mais próximo de 100%, melhor.',
  'kpi-saldo': 'Saldo agregado de Google Ads de todos os clientes ativos. Quando o saldo cai abaixo de R$ 200, o card emite alerta vermelho e sugere o envio da mensagem #SALDOGOOGLE ao cliente.',
  'morning-briefing': 'Briefing matinal gerado por IA (Gemini Flash) com resumo do dia: inadimplentes, clientes em onboarding, alertas críticos e oportunidades de crescimento. Atualizado ao carregar a página.',
  'weather-clock': 'Relógio digital com hora e data em tempo real, além de condições climáticas da localização atual (temperatura, descrição, ícone). Os dados de clima são obtidos via API de geolocalização.',
  'acoes-dia': 'Lista das 5 ações prioritárias do dia, calculadas automaticamente com base no status dos clientes: cobranças em atraso (crítico ≥15d, atenção ≥7d), novos clientes recebidos e clientes congelados aguardando retorno.',
  'clientes-progresso': 'Lista vertical com todos os clientes em progresso (não congelados e não cancelados), mostrando status com indicador colorido e dias em atraso quando aplicável. Acesso rápido ao WhatsApp e página do cliente.',
  'dre-sparkline': 'DRE (Demonstrativo de Resultado) com gráficos sparkline de receita, despesas e lucro nos últimos meses. Permite visualizar a tendência financeira da agência de forma compacta.',
  'alertas-criticos': 'Painel de alertas críticos do sistema: clientes com inadimplência acima do limite, saldo Google Ads baixo, e outros alertas configurados. Cada alerta tem link direto para resolução.',
  'gemini-chat': 'Chat integrado com Gemini AI para consultas rápidas sobre os dados da agência: análise de clientes, sugestões de ações, resumos de campanhas e muito mais. Contexto carregado automaticamente.',
  'clientes-foco': 'Cards horizontais dos clientes que precisam de atenção imediata — inadimplentes ou congelados — ordenados por urgência. Exibe dias em atraso e botões de ação rápida (WhatsApp, página do cliente).',
  'activity-feed': 'Feed das últimas ações realizadas no sistema nas últimas 24h: criação de tarefas, atualizações de clientes, pagamentos recebidos e outras atividades registradas no audit log.',
  'timeline-onboarding': 'Linha do tempo com todos os clientes em processo de onboarding, mostrando etapas concluídas, pendentes e próximas ações. Facilita o acompanhamento do progresso de entrada de novos clientes.',
  'timeline-recurring': 'Linha do tempo de tarefas recorrentes do portfólio: otimizações mensais, relatórios periódicos e outras atividades que se repetem regularmente para cada cliente.',
  'timeline-alerts': 'Linha do tempo consolidada de alertas ativos: vencimentos próximos, renovações de contrato, cobranças programadas e outros eventos que requerem atenção nos próximos dias.',
  'proximas-cobrancas': 'Lista de clientes com pagamentos em atraso ordenados por dias de inadimplência. Mostra MRR de cada cliente e permite acesso rápido ao WhatsApp para cobrança.',
  'churn-risk': 'Clientes com risco de churn: health score baixo, inadimplência ou status congelado. Ordena por nível de risco para priorizar ações de retenção.',
  'top-performers': 'Top 5 clientes mais valiosos por MRR. Útil para identificar contas que merecem atenção especial e upsell.',
  'central-comando': 'Central de Comando — agrega tudo que precisa de atenção hoje: tarefas vencidas, cobranças em atraso, posts para publicar e alertas não lidos. Visão única do dia.',
  'goals-card': 'Metas da agência com barras de progresso: MRR, número de clientes, taxa de conversão e outras métricas configuradas. Gerencie em Configurações.',
  'alerta-saldo-google': 'Alerta preditivo de saldo Google Ads: cruza o saldo atual de cada cliente com o gasto médio diário dos últimos snapshots para estimar em quantos dias a verba acaba. Mostra apenas clientes em alerta (≤7 dias) ou crítico (≤3 dias).',
  'recent-transactions': 'Últimos lançamentos financeiros da agência (receitas e despesas) em tempo real, direto da tabela financeiro_lancamentos. Receitas em verde, custos em vermelho. Clique em "Ver todas" para o módulo Financeiro completo.',
  'saude-sistema': 'Saúde do Sistema — visão única do que está funcionando e do que está pendente: integrações Google por cliente (sincronizando OK, pendência de setup, erro no último sync) e as rotinas automáticas do robô (cron) com o último run de cada uma.',
}
const BREAKPOINTS = { xl: 1400, lg: 1024, md: 768, sm: 480 }
const COLS        = { xl: 12,   lg: 10,   md: 6,   sm: 2   }

// Layouts type já importado de @/lib/database

interface SizePreset {
  id: 'compact' | 'normal' | 'large' | 'max'
  sizes: Record<string, { w: number; h: number }>
}

const CARD_SIZE_PRESETS: Record<string, SizePreset[]> = {
  'weather-clock': [
    { id: 'compact', sizes: { xl: { w: 2, h: 3 }, lg: { w: 2, h: 3 }, md: { w: 2, h: 3 }, sm: { w: 2, h: 3 } } },
    { id: 'normal', sizes: { xl: { w: 3, h: 4 }, lg: { w: 2, h: 4 }, md: { w: 3, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'large', sizes: { xl: { w: 4, h: 5 }, lg: { w: 3, h: 5 }, md: { w: 4, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'max', sizes: { xl: { w: 6, h: 6 }, lg: { w: 5, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
  ],
  'kpi-ativos': [
    { id: 'compact', sizes: { xl: { w: 2, h: 2 }, lg: { w: 2, h: 2 }, md: { w: 2, h: 2 }, sm: { w: 2, h: 2 } } },
    { id: 'normal', sizes: { xl: { w: 3, h: 3 }, lg: { w: 3, h: 3 }, md: { w: 3, h: 3 }, sm: { w: 2, h: 2 } } },
    { id: 'large', sizes: { xl: { w: 4, h: 4 }, lg: { w: 4, h: 4 }, md: { w: 4, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'max', sizes: { xl: { w: 6, h: 5 }, lg: { w: 5, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
  ],
  'kpi-mrr': [
    { id: 'compact', sizes: { xl: { w: 2, h: 2 }, lg: { w: 2, h: 2 }, md: { w: 2, h: 2 }, sm: { w: 2, h: 2 } } },
    { id: 'normal', sizes: { xl: { w: 3, h: 3 }, lg: { w: 3, h: 3 }, md: { w: 3, h: 3 }, sm: { w: 2, h: 2 } } },
    { id: 'large', sizes: { xl: { w: 4, h: 4 }, lg: { w: 4, h: 4 }, md: { w: 4, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'max', sizes: { xl: { w: 6, h: 5 }, lg: { w: 5, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
  ],
  'kpi-retencao': [
    { id: 'compact', sizes: { xl: { w: 2, h: 2 }, lg: { w: 2, h: 2 }, md: { w: 2, h: 2 }, sm: { w: 2, h: 2 } } },
    { id: 'normal', sizes: { xl: { w: 3, h: 3 }, lg: { w: 2, h: 3 }, md: { w: 3, h: 3 }, sm: { w: 2, h: 2 } } },
    { id: 'large', sizes: { xl: { w: 4, h: 4 }, lg: { w: 3, h: 4 }, md: { w: 4, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'max', sizes: { xl: { w: 6, h: 5 }, lg: { w: 5, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
  ],
  'kpi-saldo': [
    { id: 'compact', sizes: { xl: { w: 2, h: 2 }, lg: { w: 2, h: 2 }, md: { w: 2, h: 2 }, sm: { w: 2, h: 2 } } },
    { id: 'normal', sizes: { xl: { w: 3, h: 3 }, lg: { w: 2, h: 3 }, md: { w: 3, h: 3 }, sm: { w: 2, h: 2 } } },
    { id: 'large', sizes: { xl: { w: 4, h: 4 }, lg: { w: 3, h: 4 }, md: { w: 4, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'max', sizes: { xl: { w: 6, h: 5 }, lg: { w: 5, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
  ],
  'morning-briefing': [
    { id: 'compact', sizes: { xl: { w: 3, h: 2 }, lg: { w: 3, h: 2 }, md: { w: 3, h: 2 }, sm: { w: 2, h: 2 } } },
    { id: 'normal', sizes: { xl: { w: 5, h: 4 }, lg: { w: 5, h: 4 }, md: { w: 6, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'large', sizes: { xl: { w: 6, h: 5 }, lg: { w: 6, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'max', sizes: { xl: { w: 8, h: 6 }, lg: { w: 7, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
  ],
  'acoes-dia': [
    { id: 'compact', sizes: { xl: { w: 3, h: 2 }, lg: { w: 2, h: 2 }, md: { w: 2, h: 2 }, sm: { w: 2, h: 2 } } },
    { id: 'normal', sizes: { xl: { w: 4, h: 4 }, lg: { w: 3, h: 4 }, md: { w: 3, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'large', sizes: { xl: { w: 5, h: 5 }, lg: { w: 4, h: 5 }, md: { w: 4, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'max', sizes: { xl: { w: 7, h: 6 }, lg: { w: 6, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
  ],
  'dre-sparkline': [
    { id: 'compact', sizes: { xl: { w: 4, h: 3 }, lg: { w: 4, h: 3 }, md: { w: 4, h: 3 }, sm: { w: 2, h: 3 } } },
    { id: 'normal', sizes: { xl: { w: 7, h: 6 }, lg: { w: 6, h: 6 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'large', sizes: { xl: { w: 9, h: 7 }, lg: { w: 8, h: 7 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
    { id: 'max', sizes: { xl: { w: 12, h: 8 }, lg: { w: 10, h: 8 }, md: { w: 6, h: 7 }, sm: { w: 2, h: 6 } } },
  ],
  'alertas-criticos': [
    { id: 'compact', sizes: { xl: { w: 4, h: 2 }, lg: { w: 4, h: 2 }, md: { w: 3, h: 2 }, sm: { w: 2, h: 2 } } },
    { id: 'normal', sizes: { xl: { w: 6, h: 4 }, lg: { w: 5, h: 4 }, md: { w: 3, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'large', sizes: { xl: { w: 8, h: 5 }, lg: { w: 7, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'max', sizes: { xl: { w: 12, h: 6 }, lg: { w: 10, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
  ],
  'gemini-chat': [
    { id: 'compact', sizes: { xl: { w: 4, h: 2 }, lg: { w: 4, h: 2 }, md: { w: 3, h: 2 }, sm: { w: 2, h: 2 } } },
    { id: 'normal', sizes: { xl: { w: 6, h: 4 }, lg: { w: 5, h: 4 }, md: { w: 3, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'large', sizes: { xl: { w: 8, h: 5 }, lg: { w: 7, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'max', sizes: { xl: { w: 12, h: 6 }, lg: { w: 10, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
  ],
  'clientes-foco': [
    { id: 'compact', sizes: { xl: { w: 5, h: 2 }, lg: { w: 4, h: 2 }, md: { w: 4, h: 2 }, sm: { w: 2, h: 2 } } },
    { id: 'normal', sizes: { xl: { w: 8, h: 4 }, lg: { w: 6, h: 4 }, md: { w: 6, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'large', sizes: { xl: { w: 10, h: 5 }, lg: { w: 8, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'max', sizes: { xl: { w: 12, h: 6 }, lg: { w: 10, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
  ],
  'clientes-progresso': [
    { id: 'compact', sizes: { xl: { w: 4, h: 3 }, lg: { w: 4, h: 3 }, md: { w: 4, h: 3 }, sm: { w: 2, h: 3 } } },
    { id: 'normal', sizes: { xl: { w: 5, h: 6 }, lg: { w: 4, h: 6 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'large', sizes: { xl: { w: 7, h: 7 }, lg: { w: 6, h: 7 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
    { id: 'max', sizes: { xl: { w: 9, h: 8 }, lg: { w: 8, h: 8 }, md: { w: 6, h: 7 }, sm: { w: 2, h: 6 } } },
  ],
  'activity-feed': [
    { id: 'compact', sizes: { xl: { w: 3, h: 2 }, lg: { w: 3, h: 2 }, md: { w: 3, h: 2 }, sm: { w: 2, h: 2 } } },
    { id: 'normal', sizes: { xl: { w: 4, h: 4 }, lg: { w: 4, h: 4 }, md: { w: 6, h: 4 }, sm: { w: 2, h: 3 } } },
    { id: 'large', sizes: { xl: { w: 6, h: 5 }, lg: { w: 5, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'max', sizes: { xl: { w: 8, h: 6 }, lg: { w: 7, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
  ],
  'proximas-cobrancas': [
    { id: 'compact', sizes: { xl: { w: 3, h: 3 }, lg: { w: 3, h: 3 }, md: { w: 3, h: 3 }, sm: { w: 2, h: 3 } } },
    { id: 'normal', sizes: { xl: { w: 4, h: 5 }, lg: { w: 4, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'large', sizes: { xl: { w: 5, h: 6 }, lg: { w: 5, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
    { id: 'max', sizes: { xl: { w: 6, h: 7 }, lg: { w: 6, h: 7 }, md: { w: 6, h: 7 }, sm: { w: 2, h: 6 } } },
  ],
  'churn-risk': [
    { id: 'compact', sizes: { xl: { w: 3, h: 3 }, lg: { w: 3, h: 3 }, md: { w: 3, h: 3 }, sm: { w: 2, h: 3 } } },
    { id: 'normal', sizes: { xl: { w: 4, h: 5 }, lg: { w: 4, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'large', sizes: { xl: { w: 5, h: 6 }, lg: { w: 5, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
    { id: 'max', sizes: { xl: { w: 6, h: 7 }, lg: { w: 6, h: 7 }, md: { w: 6, h: 7 }, sm: { w: 2, h: 6 } } },
  ],
  'top-performers': [
    { id: 'compact', sizes: { xl: { w: 3, h: 3 }, lg: { w: 3, h: 3 }, md: { w: 3, h: 3 }, sm: { w: 2, h: 3 } } },
    { id: 'normal', sizes: { xl: { w: 4, h: 5 }, lg: { w: 4, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'large', sizes: { xl: { w: 5, h: 6 }, lg: { w: 5, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
    { id: 'max', sizes: { xl: { w: 6, h: 7 }, lg: { w: 6, h: 7 }, md: { w: 6, h: 7 }, sm: { w: 2, h: 6 } } },
  ],
  'central-comando': [
    { id: 'compact', sizes: { xl: { w: 4, h: 4 }, lg: { w: 4, h: 4 }, md: { w: 6, h: 4 }, sm: { w: 2, h: 4 } } },
    { id: 'normal', sizes: { xl: { w: 6, h: 6 }, lg: { w: 5, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
    { id: 'large', sizes: { xl: { w: 8, h: 7 }, lg: { w: 7, h: 7 }, md: { w: 6, h: 7 }, sm: { w: 2, h: 6 } } },
    { id: 'max', sizes: { xl: { w: 12, h: 8 }, lg: { w: 10, h: 8 }, md: { w: 6, h: 8 }, sm: { w: 2, h: 7 } } },
  ],
  'goals-card': [
    { id: 'compact', sizes: { xl: { w: 3, h: 3 }, lg: { w: 3, h: 3 }, md: { w: 3, h: 3 }, sm: { w: 2, h: 3 } } },
    { id: 'normal', sizes: { xl: { w: 4, h: 5 }, lg: { w: 4, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'large', sizes: { xl: { w: 6, h: 6 }, lg: { w: 5, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
    { id: 'max', sizes: { xl: { w: 8, h: 7 }, lg: { w: 7, h: 7 }, md: { w: 6, h: 7 }, sm: { w: 2, h: 6 } } },
  ],
  'alerta-saldo-google': [
    { id: 'compact', sizes: { xl: { w: 3, h: 3 }, lg: { w: 3, h: 3 }, md: { w: 3, h: 3 }, sm: { w: 2, h: 3 } } },
    { id: 'normal', sizes: { xl: { w: 4, h: 5 }, lg: { w: 4, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 4 } } },
    { id: 'large', sizes: { xl: { w: 6, h: 6 }, lg: { w: 5, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 5 } } },
    { id: 'max', sizes: { xl: { w: 8, h: 7 }, lg: { w: 7, h: 7 }, md: { w: 6, h: 7 }, sm: { w: 2, h: 6 } } },
  ],
  'recent-transactions': [
    { id: 'compact', sizes: { xl: { w: 3, h: 4 }, lg: { w: 3, h: 4 }, md: { w: 3, h: 4 }, sm: { w: 2, h: 4 } } },
    { id: 'normal', sizes: { xl: { w: 4, h: 5 }, lg: { w: 4, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 5 } } },
    { id: 'large', sizes: { xl: { w: 5, h: 6 }, lg: { w: 5, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 6 } } },
    { id: 'max', sizes: { xl: { w: 7, h: 7 }, lg: { w: 6, h: 7 }, md: { w: 6, h: 7 }, sm: { w: 2, h: 7 } } },
  ],
  'saude-sistema': [
    { id: 'compact', sizes: { xl: { w: 3, h: 4 }, lg: { w: 3, h: 4 }, md: { w: 3, h: 4 }, sm: { w: 2, h: 4 } } },
    { id: 'normal', sizes: { xl: { w: 4, h: 5 }, lg: { w: 4, h: 5 }, md: { w: 6, h: 5 }, sm: { w: 2, h: 5 } } },
    { id: 'large', sizes: { xl: { w: 6, h: 6 }, lg: { w: 5, h: 6 }, md: { w: 6, h: 6 }, sm: { w: 2, h: 6 } } },
    { id: 'max', sizes: { xl: { w: 8, h: 7 }, lg: { w: 7, h: 7 }, md: { w: 6, h: 7 }, sm: { w: 2, h: 7 } } },
  ],
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

const DEFAULT_LAYOUTS: LayoutsType = {
  xl: [
    // ROW 0-5: Hero (DRE) + Lista (Clientes) — espelho da referência
    { i: 'dre-sparkline',     x: 0,  y: 0,  w: 7,  h: 6, minW: 4, minH: 4 },
    { i: 'clientes-progresso',x: 7,  y: 0,  w: 5,  h: 6, minW: 3, minH: 4 },
    // ROW 6-8: Morning Briefing + Ações + Weather
    { i: 'morning-briefing',  x: 0,  y: 6,  w: 5,  h: 4, minW: 3, minH: 3 },
    { i: 'acoes-dia',         x: 5,  y: 6,  w: 4,  h: 4, minW: 3, minH: 3 },
    { i: 'weather-clock',     x: 9,  y: 6,  w: 3,  h: 4, minW: 2, minH: 3 },
    // ROW 10-11: 4 KPI cards
    { i: 'kpi-ativos',        x: 0,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    { i: 'kpi-mrr',           x: 3,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    { i: 'kpi-retencao',      x: 6,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    { i: 'kpi-saldo',         x: 9,  y: 10, w: 3,  h: 3, minW: 2, minH: 2 },
    // ROW 13-15: Alertas + Gemini
    { i: 'alertas-criticos',  x: 0,  y: 13, w: 6,  h: 4, minW: 4, minH: 2 },
    { i: 'gemini-chat',       x: 6,  y: 13, w: 6,  h: 4, minW: 4, minH: 2 },
    // ROW 17-20: Clientes em Foco
    { i: 'clientes-foco',     x: 0,  y: 17, w: 8,  h: 4, minW: 6, minH: 3 },
    // ROW 17: Activity Feed
    { i: 'activity-feed',     x: 8,  y: 17, w: 4,  h: 4, minW: 3, minH: 3 },
    // ROW 21: Timeline Cards (Onboarding, Recurring, Alerts)
    { i: 'timeline-onboarding', x: 0, y: 21, w: 4, h: 5, minW: 3, minH: 3 },
    { i: 'timeline-recurring',  x: 4, y: 21, w: 4, h: 5, minW: 3, minH: 3 },
    { i: 'timeline-alerts',     x: 8, y: 21, w: 4, h: 5, minW: 3, minH: 3 },
    // ROW 26: Novos cards operacionais
    { i: 'proximas-cobrancas',  x: 0, y: 26, w: 4, h: 5, minW: 3, minH: 3 },
    { i: 'churn-risk',          x: 4, y: 26, w: 4, h: 5, minW: 3, minH: 3 },
    { i: 'top-performers',      x: 8, y: 26, w: 4, h: 5, minW: 3, minH: 3 },
    // ROW 31: Central de Comando + Metas
    { i: 'central-comando',     x: 0, y: 31, w: 8, h: 6, minW: 4, minH: 4 },
    { i: 'goals-card',          x: 8, y: 31, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'alerta-saldo-google', x: 0, y: 37, w: 4, h: 5, minW: 3, minH: 3 },
    { i: 'recent-transactions', x: 4, y: 37, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'saude-sistema',       x: 8, y: 37, w: 4, h: 5, minW: 3, minH: 4 },
  ],
  lg: [
    { i: 'dre-sparkline',     x: 0,  y: 0,  w: 6,  h: 6 },
    { i: 'clientes-progresso',x: 6,  y: 0,  w: 4,  h: 6 },
    { i: 'morning-briefing',  x: 0,  y: 6,  w: 5,  h: 4 },
    { i: 'acoes-dia',         x: 5,  y: 6,  w: 3,  h: 4 },
    { i: 'weather-clock',     x: 8,  y: 6,  w: 2,  h: 4 },
    { i: 'kpi-ativos',        x: 0,  y: 10, w: 3,  h: 3 },
    { i: 'kpi-mrr',           x: 3,  y: 10, w: 3,  h: 3 },
    { i: 'kpi-retencao',      x: 6,  y: 10, w: 2,  h: 3 },
    { i: 'kpi-saldo',         x: 8,  y: 10, w: 2,  h: 3 },
    { i: 'alertas-criticos',  x: 0,  y: 13, w: 5,  h: 4 },
    { i: 'gemini-chat',       x: 5,  y: 13, w: 5,  h: 4 },
    { i: 'clientes-foco',     x: 0,  y: 17, w: 6,  h: 4 },
    { i: 'activity-feed',     x: 6,  y: 17, w: 4,  h: 4 },
    { i: 'timeline-onboarding', x: 0, y: 21, w: 5, h: 5 },
    { i: 'timeline-recurring',  x: 5, y: 21, w: 5, h: 5 },
    { i: 'timeline-alerts',     x: 0, y: 26, w: 10, h: 5 },
    { i: 'proximas-cobrancas',  x: 0, y: 31, w: 4, h: 5 },
    { i: 'churn-risk',          x: 4, y: 31, w: 3, h: 5 },
    { i: 'top-performers',      x: 7, y: 31, w: 3, h: 5 },
    { i: 'central-comando',     x: 0, y: 36, w: 7, h: 6 },
    { i: 'goals-card',          x: 7, y: 36, w: 3, h: 6 },
    { i: 'alerta-saldo-google', x: 0, y: 42, w: 4, h: 5 },
    { i: 'recent-transactions', x: 4, y: 42, w: 3, h: 5 },
    { i: 'saude-sistema',       x: 7, y: 42, w: 3, h: 5 },
  ],
  md: [
    { i: 'dre-sparkline',     x: 0,  y: 0,  w: 6,  h: 5 },
    { i: 'clientes-progresso',x: 0,  y: 5,  w: 6,  h: 5 },
    { i: 'morning-briefing',  x: 0,  y: 10, w: 6,  h: 4 },
    { i: 'acoes-dia',         x: 0,  y: 14, w: 3,  h: 4 },
    { i: 'weather-clock',     x: 3,  y: 14, w: 3,  h: 4 },
    { i: 'kpi-ativos',        x: 0,  y: 18, w: 3,  h: 3 },
    { i: 'kpi-mrr',           x: 3,  y: 18, w: 3,  h: 3 },
    { i: 'kpi-retencao',      x: 0,  y: 21, w: 3,  h: 3 },
    { i: 'kpi-saldo',         x: 3,  y: 21, w: 3,  h: 3 },
    { i: 'alertas-criticos',  x: 0,  y: 24, w: 3,  h: 4 },
    { i: 'gemini-chat',       x: 3,  y: 24, w: 3,  h: 4 },
    { i: 'clientes-foco',     x: 0,  y: 28, w: 6,  h: 4 },
    { i: 'activity-feed',     x: 0,  y: 32, w: 6,  h: 4 },
    { i: 'timeline-onboarding', x: 0, y: 36, w: 6, h: 5 },
    { i: 'timeline-recurring',  x: 0, y: 41, w: 6, h: 5 },
    { i: 'timeline-alerts',     x: 0, y: 46, w: 6, h: 5 },
    { i: 'proximas-cobrancas',  x: 0, y: 51, w: 6, h: 5 },
    { i: 'churn-risk',          x: 0, y: 56, w: 6, h: 5 },
    { i: 'top-performers',      x: 0, y: 61, w: 6, h: 5 },
    { i: 'central-comando',     x: 0, y: 66, w: 6, h: 6 },
    { i: 'goals-card',          x: 0, y: 72, w: 6, h: 5 },
    { i: 'alerta-saldo-google', x: 0, y: 77, w: 6, h: 5 },
    { i: 'recent-transactions', x: 0, y: 82, w: 6, h: 5 },
    { i: 'saude-sistema',       x: 0, y: 87, w: 6, h: 5 },
  ],
  sm: [
    { i: 'dre-sparkline',     x: 0, y: 0,  w: 2, h: 5 },
    { i: 'clientes-progresso',x: 0, y: 5,  w: 2, h: 6 },
    { i: 'morning-briefing',  x: 0, y: 11, w: 2, h: 4 },
    { i: 'acoes-dia',         x: 0, y: 15, w: 2, h: 5 },
    { i: 'weather-clock',     x: 0, y: 20, w: 2, h: 3 },
    { i: 'kpi-ativos',        x: 0, y: 23, w: 2, h: 3 },
    { i: 'kpi-mrr',           x: 0, y: 26, w: 2, h: 3 },
    { i: 'kpi-retencao',      x: 0, y: 29, w: 2, h: 3 },
    { i: 'kpi-saldo',         x: 0, y: 32, w: 2, h: 3 },
    { i: 'alertas-criticos',  x: 0, y: 35, w: 2, h: 4 },
    { i: 'gemini-chat',       x: 0, y: 39, w: 2, h: 4 },
    { i: 'clientes-foco',     x: 0, y: 43, w: 2, h: 4 },
    { i: 'activity-feed',     x: 0, y: 47, w: 2, h: 4 },
    { i: 'timeline-onboarding', x: 0, y: 51, w: 2, h: 5 },
    { i: 'timeline-recurring',  x: 0, y: 56, w: 2, h: 5 },
    { i: 'timeline-alerts',     x: 0, y: 61, w: 2, h: 5 },
    { i: 'proximas-cobrancas',  x: 0, y: 66, w: 2, h: 5 },
    { i: 'churn-risk',          x: 0, y: 71, w: 2, h: 5 },
    { i: 'top-performers',      x: 0, y: 76, w: 2, h: 5 },
    { i: 'central-comando',     x: 0, y: 81, w: 2, h: 6 },
    { i: 'goals-card',          x: 0, y: 87, w: 2, h: 5 },
    { i: 'alerta-saldo-google', x: 0, y: 92, w: 2, h: 5 },
    { i: 'recent-transactions', x: 0, y: 97, w: 2, h: 5 },
    { i: 'saude-sistema',       x: 0, y: 102, w: 2, h: 5 },
  ],
}

export default function DashboardPage() {
  const { dados, loading, metricas, recarregar } = useClientes()
  const { setContextActions, clearContextActions } = useRightSidebarStore()
  const [saldoGoogle, setSaldoGoogle] = useState<number | null>(null)
  const [mostrarWizard, setMostrarWizard] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const [confirmBtnPos, setConfirmBtnPos] = useState<{ top: number; right: number } | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [layouts, setLayouts] = useState<LayoutsType>(DEFAULT_LAYOUTS)
  const [layoutSnapshot, setLayoutSnapshot] = useState<LayoutsType>(DEFAULT_LAYOUTS)
  const [containerWidth, setContainerWidth] = useState(1200)
  const containerRef = useRef<HTMLDivElement>(null)

  // Medir largura do container para passar ao RGL
  const measureWidth = useCallback(() => {
    if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth)
  }, [])

  useEffect(() => {
    measureWidth()
    const ro = new ResizeObserver(measureWidth)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [measureWidth])

  // Carregar layout do Supabase (prioridade) ou localStorage + verificar onboarding
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser()
      const uid = data.user?.id ?? null
      setUserId(uid)

      if (uid) {
        try {
          const savedLayout = await carregarDashboardLayout(uid)
          if (savedLayout) {
            setLayouts(savedLayout)
          } else {
            // fallback localStorage
            try {
              const local = localStorage.getItem(STORAGE_KEY)
              if (local) setLayouts(JSON.parse(local) as LayoutsType)
            } catch {}
          }
        } catch (err) {
          console.error('[Dashboard] Erro ao carregar layout:', err)
          // fallback localStorage em caso de erro
          try {
            const local = localStorage.getItem(STORAGE_KEY)
            if (local) setLayouts(JSON.parse(local) as LayoutsType)
          } catch {}
        }
      } else {
        // Sem login: carregar apenas localStorage
        try {
          const local = localStorage.getItem(STORAGE_KEY)
          if (local) setLayouts(JSON.parse(local) as LayoutsType)
        } catch {}
      }
    })()

    try {
      if (!localStorage.getItem('adsgator_onboarding_done')) {
        setMostrarWizard(true)
      }
    } catch {}
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = (_: any[], allLayouts: Record<string, any[]>) => {
    // Só atualiza estado — save acontece apenas ao confirmar edit mode
    setLayouts(allLayouts)
  }

  const handleConfirmEdit = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setConfirmBtnPos({ top: rect.top, right: window.innerWidth - rect.left })
    setShowSaveConfirm(true)
  }, [])

  const handleSaveLayout = useCallback(async (asDefault: boolean) => {
    setShowSaveConfirm(false)
    setConfirmBtnPos(null)
    setEditMode(false)
    if (userId) {
      try {
        await salvarDashboardLayout(userId, layouts)
      } catch (err) {
        console.error('[Dashboard] Erro ao salvar layout:', err)
        toast.error('Erro ao salvar layout')
        return
      }
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts)) } catch {}
    if (asDefault) {
      try { localStorage.setItem(`${STORAGE_KEY}-default`, JSON.stringify(layouts)) } catch {}
      toast.success('Layout salvo e definido como padrão da conta')
    } else {
      toast.success('Layout salvo')
    }
    setSaveAsDefault(false)
  }, [userId, layouts])

  const handleCancelEdit = useCallback(() => {
    setLayouts(layoutSnapshot)
    setEditMode(false)
  }, [layoutSnapshot])

  const enterEdit = useCallback(() => {
    setLayoutSnapshot(layouts)
    setEditMode(true)
  }, [layouts])

  const handleReset = async () => {
    setLayouts(DEFAULT_LAYOUTS)
    if (userId) {
      try {
        await salvarDashboardLayout(userId, DEFAULT_LAYOUTS)
      } catch (err) {
        console.error('[Dashboard] Erro ao resetar layout:', err)
      }
    }
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    toast.success('Layout resetado')
  }

  const handleCardSizeChange = (cardId: string, preset: 'compact' | 'normal' | 'large' | 'max') => {
    const presets = CARD_SIZE_PRESETS[cardId]
    if (!presets) return

    const selected = presets.find(p => p.id === preset)
    if (!selected) return

    setLayouts(prev => {
      const updated = { ...prev }
      Object.keys(BREAKPOINTS).forEach((bp) => {
        const layout = updated[bp] || []
        const idx = layout.findIndex((item: any) => item.i === cardId)
        if (idx >= 0 && selected.sizes[bp]) {
          const newSize = selected.sizes[bp]
          layout[idx] = { ...layout[idx], w: newSize.w, h: newSize.h }
        }
      })
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {}
      return updated
    })
    toast.success(`Card redimensionado para "${preset === 'compact' ? 'Compacto' : preset === 'normal' ? 'Normal' : preset === 'large' ? 'Grande' : 'Máximo'}"`)
  }

  // Cria uma função bound para cada cardId
  const makeCardResizer = (cardId: string) => (preset: 'compact' | 'normal' | 'large' | 'max') => {
    handleCardSizeChange(cardId, preset)
  }

  useEffect(() => {
    supabase
      .from('clientes')
      .select('saldo_google')
      .eq('status', 'ativo')
      .then(({ data }) => {
        const total = ((data ?? []) as { saldo_google?: number }[]).reduce((s, c) => s + (c.saldo_google ?? 0), 0)
        setSaldoGoogle(total)
      })
  }, [])

  // Injetar controles de edit na RightSidebar
  useEffect(() => {
    if (editMode) {
      setContextActions([
        { id: 'confirm-edit', icon: Check, label: 'Confirmar layout', onClick: handleConfirmEdit },
        { id: 'cancel-edit', icon: X, label: 'Cancelar edição', onClick: handleCancelEdit },
      ])
    } else {
      setContextActions([
        { id: 'edit-layout', icon: LayoutDashboard, label: 'Editar layout', onClick: enterEdit },
      ])
    }
    return () => clearContextActions()
  }, [editMode])

  const progresso = dados.filter((d) =>
    d.cliente.status !== 'congelado' && d.cliente.status !== 'cancelado'
  )

  const acoesDoDia = useMemo(() => {
    const acoes: AcaoItem[] = []
    dados.forEach(({ cliente, estagio }) => {
      const dias           = diasAtrasoCliente(cliente)
      const nivelCobranca  = estagioInadimplencia(dias)
      if (nivelCobranca === 'critico' || nivelCobranca === 'grave') {
        acoes.push({ cliente, estagio, urgencia: 'critica', descricao: `${dias} dias sem pagamento — envie notificação de rescisão`, acaoLabel: '#COBRANÇA', whatsapp: cliente.whatsapp ? gerarLinkWhatsApp(`Olá ${cliente.nome.split(' ')[0]}. Em razão do atraso de ${dias} dias, comunicamos a rescisão contratual.`, cliente.whatsapp) : undefined })
      } else if (nivelCobranca === 'suspensao') {
        acoes.push({ cliente, estagio, urgencia: 'atencao', descricao: `${dias} dias em atraso — campanha em risco de suspensão`, acaoLabel: '#ALERTA D+7', whatsapp: cliente.whatsapp ? gerarLinkWhatsApp(`Olá ${cliente.nome.split(' ')[0]}! Seu pagamento está em atraso há ${dias} dias.`, cliente.whatsapp) : undefined })
      } else if (cliente.status === 'recebido') {
        acoes.push({ cliente, estagio, urgencia: 'atencao', descricao: 'Novo cliente — envie o #BOASVINDAS agora', acaoLabel: '#BOASVINDAS', whatsapp: cliente.whatsapp ? gerarLinkWhatsApp('Olá! Seja bem-vindo(a) à Adsgator!', cliente.whatsapp) : undefined })
      } else if (cliente.status === 'congelado') {
        acoes.push({ cliente, estagio, urgencia: 'review', descricao: 'Cliente retido — envie lembrete de retorno', acaoLabel: 'Lembrete', whatsapp: cliente.whatsapp ? gerarLinkWhatsApp(`Olá ${cliente.nome.split(' ')[0]}! Ainda aguardamos seu retorno.`, cliente.whatsapp) : undefined })
      }
    })
    const ORDEM: Record<string, number> = { critica: 0, atencao: 1, review: 2 }
    return acoes.sort((a, b) => ORDEM[a.urgencia] - ORDEM[b.urgencia]).slice(0, 5)
  }, [dados])

  async function handleCriarTaskDeAcao(cliente: Cliente, descricao: string) {
    const { data: { user } } = await supabase.auth.getUser()
    const prazo = new Date()
    prazo.setDate(prazo.getDate() + 1)
    const { error } = await supabase.from('tarefas').insert({
      titulo: `Ação: ${cliente.nome.split(' ')[0]}`,
      descricao,
      prioridade: 'alto',
      status: 'pendente',
      cliente_id: cliente.id,
      data_prazo: prazo.toISOString(),
      user_id: user?.id,
    })
    if (error) {
      toast.error('Erro ao criar task.')
    } else {
      toast.success(`Task criada para ${cliente.nome.split(' ')[0]}!`)
    }
  }

  async function handleCongelar(clienteId: string) {
    await supabase.from('clientes').update({ status: 'congelado' }).eq('id', clienteId)
    recarregar()
  }

  const topBarActions = (
    <div className="flex items-center gap-[0.5rem]">
      <button
        onClick={recarregar}
        disabled={loading}
        className="w-[2rem] h-[2rem] flex items-center justify-center rounded-[0.375rem] bg-surface-hover border border-surface-border text-ink-secondary hover:text-ink-primary transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-[0.875rem] h-[0.875rem] ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
      </button>
      <Link
        href="/configuracoes?tab=integracoes"
        title="Importar clientes do Asaas"
        className="flex items-center gap-[0.375rem] h-[2rem] px-[0.75rem] rounded-[0.375rem] bg-ads-500 text-white text-[0.8125rem] font-medium hover:bg-ads-600 transition-colors"
      >
        <Download className="w-[0.875rem] h-[0.875rem]" strokeWidth={1.75} />
        <span className="hidden sm:inline">Importar</span>
      </Link>
    </div>
  )

  return (
    <>
    <MainLayout
      title="Dashboard"
      subtitle={`Semana de ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
      actions={topBarActions}
    >
      <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit" className="page-enter space-y-[1.5rem]" ref={containerRef}>
        {/* Banner de prontidão — fora do grid RGL, some quando setup = 100% */}
        <SetupProgressCard />

        {/* Pendências por cliente — modal que abre sozinho (1x/dia) quando há
            integração faltando, toggle desligado ou sync com erro */}
        <PendenciasModal />

        {/* ════════════════════════════════════════════════════════════ */}
        {/* News Container — Monitoramento por cliente (scroll horiz.)   */}
        {/* ════════════════════════════════════════════════════════════ */}
        <NewsContainer />

        {/* ════════════════════════════════════════════════════════════ */}
        {/* GRID CUSTOMIZÁVEL — (Rest da Dashboard anterior)            */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className={editMode ? 'ring-1 ring-ads-500/30 rounded-2xl p-[1rem]' : ''}>
          {editMode && <p className="text-ads-500 text-xs font-semibold mb-[1rem] animate-pulse">Modo de edição ativado — arraste e redimensione os cards</p>}
          {!editMode && <p className="text-ink-muted text-xs font-medium uppercase tracking-wider mb-[1rem]">Mais widgets</p>}
          <RGLResponsive
            className={editMode ? 'layout bento-edit-mode' : 'layout'}
            layouts={layouts}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={80}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            draggableHandle=".bento-drag-handle"
            onLayoutChange={handleLayoutChange}
            width={containerWidth}
            useCSSTransforms
            isResizable={editMode}
            isDraggable={editMode}
            resizeHandles={['se', 's', 'e', 'sw', 'w', 'ne', 'nw', 'n']}
            compactType="vertical"
            preventCollision={false}
          >
          {/* ── KPIs ─────────────────────────────── */}
          <div key="kpi-ativos">
            <BentoCard editMode={editMode} cardId="kpi-ativos" onSizeChange={makeCardResizer('kpi-ativos')} noPadding description={CARD_DESCRIPTIONS['kpi-ativos']} onEnterEdit={enterEdit}>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="Clientes Ativos" value={metricas.ativos} accentColor="amber" icon={<Users className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} href="/clientes" />
              }
            </BentoCard>
          </div>

          <div key="kpi-mrr">
            <BentoCard editMode={editMode} cardId="kpi-mrr" onSizeChange={makeCardResizer('kpi-mrr')} noPadding description={CARD_DESCRIPTIONS['kpi-mrr']} onEnterEdit={enterEdit}>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="MRR" value={`R$ ${metricas.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} accentColor="green" icon={<DollarSign className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} href="/financeiro" />
              }
            </BentoCard>
          </div>

          <div key="kpi-retencao">
            <BentoCard editMode={editMode} cardId="kpi-retencao" onSizeChange={makeCardResizer('kpi-retencao')} noPadding description={CARD_DESCRIPTIONS['kpi-retencao']} onEnterEdit={enterEdit}>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="Taxa de Retenção" value={`${metricas.taxaRetencao}%`} accentColor="red" icon={<Percent className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} />
              }
            </BentoCard>
          </div>

          <div key="kpi-saldo">
            <BentoCard editMode={editMode} cardId="kpi-saldo" onSizeChange={makeCardResizer('kpi-saldo')} noPadding description={CARD_DESCRIPTIONS['kpi-saldo']} onEnterEdit={enterEdit}>
              {loading
                ? <div className="h-full rounded-xl skeleton-shimmer" />
                : <KpiCard label="Saldo Google" value={saldoGoogle !== null ? `R$ ${saldoGoogle.toLocaleString('pt-BR')}` : '…'} delta={saldoGoogle !== null && saldoGoogle < 200 ? 'Baixo' : undefined} deltaDir={saldoGoogle !== null && saldoGoogle < 200 ? 'down' : undefined} accentColor="blue" alert={saldoGoogle !== null && saldoGoogle < 200} alertLabel="Envie #SALDOGOOGLE" icon={<CreditCard className="w-[1rem] h-[1rem]" strokeWidth={1.75} />} />
              }
            </BentoCard>
          </div>

          {/* ── MORNING BRIEFING ─────────────────── */}
          <div key="morning-briefing">
            <BentoCard editMode={editMode} cardId="morning-briefing" onSizeChange={makeCardResizer('morning-briefing')} noPadding description={CARD_DESCRIPTIONS['morning-briefing']} onEnterEdit={enterEdit}>
              <MorningBriefing />
            </BentoCard>
          </div>

          {/* ── WEATHER CLOCK ────────────────────── */}
          <div key="weather-clock">
            <BentoCard editMode={editMode} cardId="weather-clock" onSizeChange={makeCardResizer('weather-clock')} noPadding description={CARD_DESCRIPTIONS['weather-clock']} onEnterEdit={enterEdit}>
              <WeatherClock />
            </BentoCard>
          </div>

          {/* ── AÇÕES DO DIA ─────────────────────── */}
          <div key="acoes-dia">
            <BentoCard editMode={editMode} cardId="acoes-dia" onSizeChange={makeCardResizer('acoes-dia')} title="Ações do Dia" subtitle="Prioridades de hoje" description={CARD_DESCRIPTIONS['acoes-dia']} onEnterEdit={enterEdit}>
              {loading || acoesDoDia.length === 0
                ? <div className="flex items-center justify-center h-full text-ink-muted text-[0.8125rem]">Nenhuma ação pendente</div>
                : <AcoesDoDia items={acoesDoDia} onCongelar={handleCongelar} onCriarTask={handleCriarTaskDeAcao} />
              }
            </BentoCard>
          </div>

          {/* ── CLIENTES EM PROGRESSO ────────────── */}
          <div key="clientes-progresso">
            <BentoCard
              editMode={editMode}
              cardId="clientes-progresso"
              onSizeChange={makeCardResizer('clientes-progresso')}
              title="Clientes em Progresso"
              subtitle={`${progresso.length} de ${metricas.total} clientes`}
              actions={<Link href="/clientes" className="text-ads-500 text-[0.75rem] hover:underline">Ver todos</Link>}
              description={CARD_DESCRIPTIONS['clientes-progresso']}
              onEnterEdit={enterEdit}
            >
              {loading ? (
                <div className="flex flex-col gap-[0.5rem]">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[2.75rem] rounded-lg skeleton-shimmer" />)}
                </div>
              ) : progresso.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-ink-muted gap-[0.5rem]">
                  <Users className="w-[2rem] h-[2rem]" strokeWidth={1} />
                  <p className="text-[0.8125rem]">Nenhum cliente em progresso</p>
                </div>
              ) : (
                <div className="flex flex-col overflow-y-auto h-full">
                  {progresso.slice(0, 10).map(({ cliente }) => {
                    const iniciais = cliente.nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
                    const diasAtraso = diasAtrasoCliente(cliente)
                    const STATUS_DOT: Record<string, string> = {
                      ativo: 'bg-status-green', recebido: 'bg-status-blue',
                      onboarding: 'bg-ads-500',  setup_trafego: 'bg-status-orange',
                      congelado: 'bg-ink-muted',  cancelado: 'bg-status-red',
                    }
                    const STATUS_LABEL: Record<string, string> = {
                      ativo: 'Ativo', recebido: 'Recebido', onboarding: 'Onboarding',
                      setup_trafego: 'Setup Tráfego', congelado: 'Congelado', cancelado: 'Cancelado',
                    }
                    return (
                      <div key={cliente.id} className="flex items-center gap-[0.75rem] py-[0.625rem] border-b border-surface-border/40 last:border-0 group">
                        <div className="w-[2rem] h-[2rem] rounded-full bg-ads-500/15 flex items-center justify-center shrink-0">
                          <span className="text-ads-500 text-[0.6875rem] font-bold">{iniciais}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ink-primary text-[0.8125rem] font-semibold truncate leading-tight">{cliente.nome}</p>
                          <div className="flex items-center gap-[0.375rem] mt-[0.125rem]">
                            <span className={`w-[0.375rem] h-[0.375rem] rounded-full shrink-0 ${STATUS_DOT[cliente.status] ?? 'bg-ink-muted'}`} />
                            <span className="text-ink-muted text-[0.6875rem]">{STATUS_LABEL[cliente.status] ?? cliente.status}</span>
                            {diasAtraso > 0 && <span className="text-status-red text-[0.6875rem] font-medium">{diasAtraso}d atraso</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-[0.25rem] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {cliente.whatsapp && (
                            <a href={gerarLinkWhatsApp('', cliente.whatsapp)} target="_blank" rel="noreferrer"
                              className="w-[1.625rem] h-[1.625rem] flex items-center justify-center rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                              <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                            </a>
                          )}
                          <a href={`/clientes/${cliente.id}`}
                            className="w-[1.625rem] h-[1.625rem] flex items-center justify-center rounded-md bg-surface-hover text-ink-secondary hover:text-ink-primary transition-colors">
                            <ExternalLink className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                          </a>
                          <button onClick={() => handleCongelar(cliente.id)}
                            className="w-[1.625rem] h-[1.625rem] flex items-center justify-center rounded-md bg-surface-hover text-ink-secondary hover:text-ink-primary transition-colors">
                            <PauseCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </BentoCard>
          </div>

          {/* ── DRE SPARKLINE ────────────────────── */}
          <div key="dre-sparkline">
            <BentoCard editMode={editMode} cardId="dre-sparkline" onSizeChange={makeCardResizer('dre-sparkline')} noPadding description={CARD_DESCRIPTIONS['dre-sparkline']} onEnterEdit={enterEdit}>
              <DRESparkline />
            </BentoCard>
          </div>

          {/* ── ALERTAS CRÍTICOS ─────────────────── */}
          <div key="alertas-criticos">
            <BentoCard editMode={editMode} cardId="alertas-criticos" onSizeChange={makeCardResizer('alertas-criticos')} noPadding description={CARD_DESCRIPTIONS['alertas-criticos']} onEnterEdit={enterEdit}>
              <AlertasCriticos />
            </BentoCard>
          </div>

          {/* ── GEMINI CHAT ──────────────────────── */}
          <div key="gemini-chat">
            <BentoCard editMode={editMode} cardId="gemini-chat" onSizeChange={makeCardResizer('gemini-chat')} noPadding description={CARD_DESCRIPTIONS['gemini-chat']} onEnterEdit={enterEdit}>
              <GeminiChat />
            </BentoCard>
          </div>

          {/* ── CLIENTES EM FOCO ─────────────────── */}
          <div key="clientes-foco">
            {(() => {
              const emFoco = dados
                .map(({ cliente }) => ({ cliente, dias: diasAtrasoCliente(cliente) }))
                .filter(({ cliente, dias }) => dias > 0 || cliente.status === 'congelado')
                .sort((a, b) => b.dias - a.dias)
                .slice(0, 5)
              return (
                <BentoCard
                  editMode={editMode}
                  cardId="clientes-foco"
                  onSizeChange={makeCardResizer('clientes-foco')}
                  title="Clientes em Foco"
                  subtitle={emFoco.length > 0 ? `${emFoco.length} cliente${emFoco.length > 1 ? 's' : ''} precisam de atenção` : 'Tudo em dia'}
                  actions={<Link href="/clientes" className="text-ads-500 text-[0.75rem] hover:underline">Ver todos</Link>}
                  description={CARD_DESCRIPTIONS['clientes-foco']}
                  onEnterEdit={enterEdit}
                >
                  {loading ? (
                    <div className="flex gap-[0.75rem]">
                      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex-1 h-[5rem] rounded-xl skeleton-shimmer" />)}
                    </div>
                  ) : emFoco.length === 0 ? (
                    <div className="flex items-center justify-center h-full gap-[0.5rem] text-status-green">
                      <span className="text-[1.5rem]">✓</span>
                      <p className="text-[0.875rem] font-medium">Nenhum cliente precisando de atenção</p>
                    </div>
                  ) : (
                    <div className="flex gap-[0.75rem] overflow-x-auto pb-[0.25rem]">
                      {emFoco.map(({ cliente: c, dias }) => {
                        const iniciais = c.nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
                        const estagioAtraso = estagioInadimplencia(dias)
                        const urgencia = estagioAtraso === 'critico' ? 'critica' : estagioAtraso !== 'em_dia' ? 'atencao' : 'congelado'
                        const corBorda = urgencia === 'critica' ? 'border-status-red/40' : urgencia === 'atencao' ? 'border-status-orange/40' : 'border-status-blue/40'
                        const corBg    = urgencia === 'critica' ? 'bg-status-red/5'   : urgencia === 'atencao' ? 'bg-status-orange/5'   : 'bg-status-blue/5'
                        const corTag   = urgencia === 'critica' ? 'text-status-red bg-status-red/10' : urgencia === 'atencao' ? 'text-status-orange bg-status-orange/10' : 'text-status-blue bg-status-blue/10'
                        return (
                          <div key={c.id} className={`flex flex-col gap-[0.5rem] p-[0.75rem] rounded-xl border ${corBorda} ${corBg} min-w-[9rem] flex-shrink-0`}>
                            <div className="flex items-center gap-[0.5rem]">
                              <div className="w-[1.75rem] h-[1.75rem] rounded-full bg-surface-elevated flex items-center justify-center shrink-0">
                                <span className="text-ink-secondary text-[0.625rem] font-bold">{iniciais}</span>
                              </div>
                              <p className="text-ink-primary text-[0.8125rem] font-semibold leading-tight truncate">{c.nome}</p>
                            </div>
                            {c.nicho && (
                              <span className="text-ink-muted text-[0.6875rem] truncate">{c.nicho}</span>
                            )}
                            <span className={`self-start text-[0.625rem] font-semibold px-[0.375rem] py-[0.125rem] rounded-full ${corTag}`}>
                              {urgencia === 'critica' ? `${dias}d atraso` : urgencia === 'atencao' ? `${dias}d atraso` : 'Congelado'}
                            </span>
                            <div className="flex gap-[0.25rem] mt-auto">
                              {c.whatsapp && (
                                <a
                                  href={gerarLinkWhatsApp('', c.whatsapp)}
                                  target="_blank" rel="noreferrer"
                                  title="WhatsApp"
                                  className="w-[1.5rem] h-[1.5rem] flex items-center justify-center rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                                >
                                  <MessageCircle className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                                </a>
                              )}
                              <a
                                href={`/clientes/${c.id}`}
                                title="Ver cliente"
                                className="w-[1.5rem] h-[1.5rem] flex items-center justify-center rounded-md bg-surface-hover text-ink-secondary hover:text-ink-primary transition-colors"
                              >
                                <ExternalLink className="w-[0.75rem] h-[0.75rem]" strokeWidth={2} />
                              </a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </BentoCard>
              )
            })()}
          </div>

          {/* ── ACTIVITY FEED ───────────────────────── */}
          <div key="activity-feed">
            <BentoCard
              editMode={editMode}
              cardId="activity-feed"
              onSizeChange={makeCardResizer('activity-feed')}
              title="Atividade Recente"
              subtitle="Últimas 24h"
              actions={<a href="/configuracoes" className="text-ads-500 text-[0.75rem] hover:underline">Ver auditoria</a>}
              description={CARD_DESCRIPTIONS['activity-feed']}
              onEnterEdit={enterEdit}
            >
              <ActivityFeed />
            </BentoCard>
          </div>

          {/* ── TIMELINE ONBOARDING ─────────────────── */}
          <div key="timeline-onboarding">
            <BentoCard editMode={editMode} cardId="timeline-onboarding" onSizeChange={makeCardResizer('timeline-onboarding')} noPadding description={CARD_DESCRIPTIONS['timeline-onboarding']} onEnterEdit={enterEdit}>
              <TimelineCard type="onboarding" />
            </BentoCard>
          </div>

          {/* ── TIMELINE RECURRING TASKS ───────────── */}
          <div key="timeline-recurring">
            <BentoCard editMode={editMode} cardId="timeline-recurring" onSizeChange={makeCardResizer('timeline-recurring')} noPadding description={CARD_DESCRIPTIONS['timeline-recurring']} onEnterEdit={enterEdit}>
              <TimelineCard type="recurring_task" />
            </BentoCard>
          </div>

          {/* ── TIMELINE ALERTS ─────────────────────── */}
          <div key="timeline-alerts">
            <BentoCard editMode={editMode} cardId="timeline-alerts" onSizeChange={makeCardResizer('timeline-alerts')} noPadding description={CARD_DESCRIPTIONS['timeline-alerts']} onEnterEdit={enterEdit}>
              <TimelineCard type="alert" />
            </BentoCard>
          </div>

          {/* ── PRÓXIMAS COBRANÇAS ───────────────────── */}
          <div key="proximas-cobrancas">
            <BentoCard editMode={editMode} cardId="proximas-cobrancas" onSizeChange={makeCardResizer('proximas-cobrancas')} title="Cobranças em Atraso" subtitle="Clientes inadimplentes" actions={<Link href="/clientes" className="text-ads-500 text-[0.75rem] hover:underline">Ver todos</Link>} description={CARD_DESCRIPTIONS['proximas-cobrancas']} onEnterEdit={enterEdit}>
              <ProximasCobrancas />
            </BentoCard>
          </div>

          {/* ── CHURN RISK ───────────────────────────── */}
          <div key="churn-risk">
            <BentoCard editMode={editMode} cardId="churn-risk" onSizeChange={makeCardResizer('churn-risk')} title="Risco de Churn" subtitle="Clientes em risco" actions={<Link href="/clientes" className="text-ads-500 text-[0.75rem] hover:underline">Ver todos</Link>} description={CARD_DESCRIPTIONS['churn-risk']} onEnterEdit={enterEdit}>
              <ChurnRisk />
            </BentoCard>
          </div>

          {/* ── TOP PERFORMERS ───────────────────────── */}
          <div key="top-performers">
            <BentoCard editMode={editMode} cardId="top-performers" onSizeChange={makeCardResizer('top-performers')} title="Top Performers" subtitle="Por MRR" description={CARD_DESCRIPTIONS['top-performers']} onEnterEdit={enterEdit}>
              <TopPerformers />
            </BentoCard>
          </div>

          {/* ── CENTRAL DE COMANDO ───────────────────── */}
          <div key="central-comando">
            <BentoCard editMode={editMode} cardId="central-comando" onSizeChange={makeCardResizer('central-comando')} title="Central de Comando" subtitle="O que fazer hoje" description={CARD_DESCRIPTIONS['central-comando']} onEnterEdit={enterEdit}>
              <CentralDeComando />
            </BentoCard>
          </div>

          {/* ── METAS DA AGÊNCIA ─────────────────────── */}
          <div key="goals-card">
            <BentoCard editMode={editMode} cardId="goals-card" onSizeChange={makeCardResizer('goals-card')} title="Metas" subtitle="Progresso da agência" actions={<a href="/configuracoes" className="text-ads-500 text-[0.75rem] hover:underline">Configurar</a>} description={CARD_DESCRIPTIONS['goals-card']} onEnterEdit={enterEdit}>
              <GoalsCard />
            </BentoCard>
          </div>

          {/* ── ALERTA SALDO GOOGLE ADS ──────────────── */}
          <div key="alerta-saldo-google" data-grid={{ x: 0, y: 92, w: 4, h: 5, minW: 3, minH: 3 }}>
            <BentoCard editMode={editMode} cardId="alerta-saldo-google" onSizeChange={makeCardResizer('alerta-saldo-google')} noPadding description={CARD_DESCRIPTIONS['alerta-saldo-google']} onEnterEdit={enterEdit}>
              <AlertaSaldoGoogle />
            </BentoCard>
          </div>

          {/* ── TRANSAÇÕES RECENTES ──────────────────── */}
          <div key="recent-transactions" data-grid={{ x: 4, y: 92, w: 4, h: 5, minW: 3, minH: 4 }}>
            <BentoCard editMode={editMode} cardId="recent-transactions" onSizeChange={makeCardResizer('recent-transactions')} noPadding description={CARD_DESCRIPTIONS['recent-transactions']} onEnterEdit={enterEdit}>
              <RecentTransactions />
            </BentoCard>
          </div>

          {/* ── SAÚDE DO SISTEMA ─────────────────────── */}
          <div key="saude-sistema" data-grid={{ x: 8, y: 92, w: 4, h: 5, minW: 3, minH: 4 }}>
            <BentoCard editMode={editMode} cardId="saude-sistema" onSizeChange={makeCardResizer('saude-sistema')} noPadding description={CARD_DESCRIPTIONS['saude-sistema']} onEnterEdit={enterEdit}>
              <SaudeDoSistema />
            </BentoCard>
          </div>
        </RGLResponsive>
        </div>
      </motion.div>
    </MainLayout>

    {mostrarWizard && (
      <OnboardingWizard onConcluir={() => setMostrarWizard(false)} />
    )}

    {/* ── Pop-up: Salvar como padrão ─────────────────────────────── */}
    <AnimatePresence>
      {showSaveConfirm && confirmBtnPos && (
        <div className="fixed inset-0 z-[9998] pointer-events-none">
          <motion.div variants={fadeScale} initial="hidden" animate="visible" exit="exit"
            className="pointer-events-auto bg-surface-elevated border border-surface-border rounded-xl shadow-2xl shadow-black/50 p-[1.25rem] w-[20rem] max-w-[90vw] absolute"
          style={{
            top: Math.min(confirmBtnPos.top, window.innerHeight - 220),
            right: confirmBtnPos.right + 8,
          }}
        >
          <div className="flex items-start gap-[0.75rem] mb-[1.25rem]">
            <div className="w-[2.25rem] h-[2.25rem] rounded-xl bg-ads-500/10 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-[1rem] h-[1rem] text-ads-500" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-ink-primary text-[0.9375rem] font-semibold leading-snug">Salvar layout</p>
              <p className="text-ink-muted text-[0.8125rem] mt-[0.25rem]">Deseja também definir este layout como padrão da conta?</p>
            </div>
          </div>

          <label className="flex items-center gap-[0.5rem] mb-[1.25rem] cursor-pointer group">
            <input
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              className="w-[1rem] h-[1rem] accent-ads-500 rounded cursor-pointer"
            />
            <span className="text-ink-secondary text-[0.8125rem] group-hover:text-ink-primary transition-colors">
              Definir como posicionamento padrão da conta
            </span>
          </label>

          <div className="flex gap-[0.5rem]">
            <button
              onClick={() => handleSaveLayout(saveAsDefault)}
              className="flex-1 h-[2.25rem] rounded-lg bg-ads-500 text-white text-[0.8125rem] font-semibold hover:bg-ads-600 transition-colors"
            >
              {saveAsDefault ? 'Salvar como padrão' : 'Salvar'}
            </button>
            <button
              onClick={() => { setShowSaveConfirm(false); setConfirmBtnPos(null); setSaveAsDefault(false) }}
              className="flex-1 h-[2.25rem] rounded-lg bg-surface-hover border border-surface-border text-ink-secondary text-[0.8125rem] font-medium hover:text-ink-primary transition-colors"
            >
              Cancelar
            </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  )
}
