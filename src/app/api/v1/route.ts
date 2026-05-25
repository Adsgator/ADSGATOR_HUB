import { NextResponse } from 'next/server'

/**
 * GET /api/v1
 * Documentação da API REST Adsgator v1
 */
export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    status: 'operational',
    documentation: {
      baseUrl: '/api/v1',
      authentication: 'Supabase JWT via Authorization header',
      endpoints: {
        clientes: {
          list: {
            method: 'GET',
            path: '/clientes',
            description: 'Lista todos os clientes',
            query: {
              status: 'string (opcional)',
              nicho: 'string (opcional)',
              limit: 'number (padrão: 50, máx: 100)',
              offset: 'number (padrão: 0)',
            },
          },
          create: {
            method: 'POST',
            path: '/clientes',
            description: 'Criar novo cliente',
            body: {
              nome: 'string (obrigatório)',
              email: 'string (obrigatório)',
              whatsapp: 'string (opcional)',
              nicho: 'string (opcional)',
              status: 'string (opcional, padrão: recebido)',
            },
          },
          get: {
            method: 'GET',
            path: '/clientes/[id]',
            description: 'Obter cliente específico',
          },
          update: {
            method: 'PATCH',
            path: '/clientes/[id]',
            description: 'Atualizar cliente',
            body: 'objeto com campos a atualizar',
          },
          delete: {
            method: 'DELETE',
            path: '/clientes/[id]',
            description: 'Deletar cliente',
          },
        },
        tarefas: {
          list: {
            method: 'GET',
            path: '/tarefas',
            description: 'Lista todas as tarefas',
            query: {
              status: 'string (opcional)',
              prioridade: 'string (opcional)',
              cliente_id: 'string (opcional)',
              limit: 'number (padrão: 50, máx: 100)',
              offset: 'number (padrão: 0)',
            },
          },
          create: {
            method: 'POST',
            path: '/tarefas',
            description: 'Criar nova tarefa',
            body: {
              titulo: 'string (obrigatório)',
              descricao: 'string (opcional)',
              prioridade: 'string (opcional, padrão: normal)',
              status: 'string (opcional, padrão: pendente)',
              data_prazo: 'string (opcional, ISO 8601)',
              cliente_id: 'string (opcional)',
              responsavel_id: 'string (opcional)',
            },
          },
          get: {
            method: 'GET',
            path: '/tarefas/[id]',
            description: 'Obter tarefa específica',
          },
          update: {
            method: 'PATCH',
            path: '/tarefas/[id]',
            description: 'Atualizar tarefa',
            body: 'objeto com campos a atualizar',
          },
          delete: {
            method: 'DELETE',
            path: '/tarefas/[id]',
            description: 'Deletar tarefa',
          },
        },
        financeiro: {
          list: {
            method: 'GET',
            path: '/financeiro',
            description: 'Lista lançamentos financeiros',
            query: {
              tipo: 'string (receita|despesa, opcional)',
              cliente_id: 'string (opcional)',
              data_inicio: 'string (ISO 8601, opcional)',
              data_fim: 'string (ISO 8601, opcional)',
              limit: 'number (padrão: 50, máx: 100)',
              offset: 'number (padrão: 0)',
            },
          },
          create: {
            method: 'POST',
            path: '/financeiro',
            description: 'Criar novo lançamento',
            body: {
              descricao: 'string (obrigatório)',
              tipo: 'string (obrigatório: receita|despesa)',
              valor: 'number (obrigatório)',
              data: 'string (obrigatório, ISO 8601)',
              cliente_id: 'string (opcional)',
              categoria: 'string (opcional)',
            },
          },
        },
      },
    },
  })
}
