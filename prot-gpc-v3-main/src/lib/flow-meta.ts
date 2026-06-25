/**
 * Mapa de fluxos demonstrados no protótipo Hub — HUB-238.
 *
 * Cada entrada corresponde a um valor do parâmetro `?flow=` passado pelo
 * hub-index.html. O banner contextual no Layout lê essa chave e exibe o
 * título, descrição e dica de onde olhar.
 */
export interface FlowMeta {
  titulo: string;
  descricao: string;
  /** Dica visual de onde focar a atenção na tela de destino. */
  dica: string;
}

export const FLOW_META: Record<string, FlowMeta> = {
  // Hub 1 — Opt-in Open Finance
  'hub1-openfinance': {
    titulo: 'Hub 1 — Opt-in Open Finance',
    descricao: 'Autorização do cliente via Pluggy com estado de token expirado.',
    dica: 'Observe o alerta âmbar no topo da tela de extratos e o botão "Renovar Bradesco".',
  },

  // Hub 2 — Upload manual, cenário lembrete
  'hub2-lembrete': {
    titulo: 'Hub 2 — Upload manual · Lembrete de prazo',
    descricao: 'Extrato com 3 dias úteis restantes antes do vencimento.',
    dica: 'Observe o badge âmbar "Lembrete de envio" no card e o alerta no topo da tela.',
  },

  // Hub 2 — Upload manual, cenário urgente
  'hub2-urgente': {
    titulo: 'Hub 2 — Upload manual · Prazo urgente',
    descricao: 'Extrato com 1 dia útil restante antes do vencimento.',
    dica: 'Observe o badge vermelho "Envio urgente" no card e o alerta incisivo na tela.',
  },

  // Hub 4 — Movimentações não identificadas
  'hub4-movimentacoes': {
    titulo: 'Hub 4 — Movimentações não identificadas',
    descricao: 'Movimentações em suspense aguardando resposta do cliente.',
    dica: 'Abra a tarefa de Fechamento e role até a seção "Precisamos da sua ajuda".',
  },

  // Hub 5 — Painel de fechamento
  'hub5-fechamento': {
    titulo: 'Hub 5 — Painel de fechamento contábil',
    descricao: 'Visibilidade do mês em andamento em linguagem de negócio.',
    dica: 'Abra a tarefa de Fechamento e observe as 4 etapas e o histórico de competências.',
  },

  // Hub 7 — Central de notificações
  'hub7-notificacoes': {
    titulo: 'Hub 7 — Central de notificações',
    descricao: 'Sino populado com os 7 tipos de alerta do Motor Contábil.',
    dica: 'Clique no ícone de sino no canto superior direito — badge "3" indica não lidas.',
  },
};