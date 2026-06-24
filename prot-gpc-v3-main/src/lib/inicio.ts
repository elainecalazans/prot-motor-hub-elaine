import { format, parseISO } from 'date-fns';
import type {
  StatusFolha,
  TarefaEntrada,
  TarefaFechamento,
  TarefaSaida,
  TipoEntrada,
} from '@/types/gpc';
import { deriveStatusEntrada } from '@/lib/status';
import {
  COMPETENCIA_ATUAL,
  HOJE_SIMULADO,
  tarefasEntrada,
  tarefasFechamento,
  tarefasSaida,
} from '@/mocks/seed';
import { solicitacoes as solicitacoesMock } from '@/mocks/solicitacoes';

/**
 * Camada de derivação da Página inicial do Hub.
 *
 * Funções PURAS (zero React) que leem os mesmos seeds e a MESMA regra de status
 * da área de Tarefas (`deriveStatusEntrada`) e montam o view-model da home:
 * pendências ordenadas por urgência, "próxima ação", o que acompanhar e o que já
 * foi concluído. Tudo aponta para a interna real de cada tarefa (`/tarefas/:id`),
 * conectando a home às demais áreas. Não reimplementa regra de status alguma.
 */

// ---- Tipos do view-model ----

/** Tom semântico de um card de acompanhamento (deriva do estado, nunca decorativo). */
export type TomAcompanhar = 'info' | 'warning' | 'success' | 'neutral';

/** Origem de uma pendência — define ícone/copy/CTA. */
export type TipoPendencia = TipoEntrada | 'guia';

export interface PendenciaVM {
  /** id da tarefa real → /tarefas/:id */
  id: string;
  tipo: TipoPendencia;
  titulo: string;
  /** Helper "por quê + quando" já montado. */
  descricao: string;
  prazo: string; // ISO
  prazoLabel: string; // "dd/MM"
  atrasada: boolean;
  valor?: number; // guias
  ctaLabel: string;
  href: string; // /tarefas/:id
}

export type AcompanharTipo = 'fechamento' | 'folha' | 'solicitacao';

export interface AcompanharVM {
  id: string;
  tipo: AcompanharTipo;
  titulo: string;
  statusLabel: string;
  detalhe: string;
  tom: TomAcompanhar;
  /** Entregável recorrente da BHub (tag "fixo"). */
  fixo: boolean;
  /** Navegável apenas quando definido (solicitações são ilustrativas). */
  href?: string;
}

export interface ConcluidaVM {
  id: string;
  titulo: string;
  descricao: string;
  href: string;
}

export interface InicioVM {
  saudacao: string;
  totalPendencias: number;
  subtitulo: string;
  proximaAcao: PendenciaVM | null;
  depois: PendenciaVM | null;
  maisPendencias: PendenciaVM[];
  acompanhar: AcompanharVM[];
  concluidas: ConcluidaVM[];
}

export interface InicioOptions {
  /** Guias marcadas como pagas (store useGuiasPagas) — pagas saem das pendências. */
  isPaga?: (id: string) => boolean;
  /** Primeiro nome para a saudação. */
  nomeUsuario?: string;
}

// ---- Helpers ----

const ddMM = (iso: string) => format(parseISO(iso), 'dd/MM');

const formatBRL = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

/** Título de exibição de uma pendência de entrada (mais acionável que o seed). */
const TITULO_ENTRADA: Record<TipoEntrada, string> = {
  extratos: 'Envie os extratos bancários',
  notas: 'Envie as notas fiscais emitidas',
  fechamento: 'Envie os insumos do fechamento',
  rejeitados: 'Regularize o documento rejeitado',
  'documentacao-pendente': 'Envie a documentação pendente',
};

/** Motivo/"por quê" de uma pendência de entrada. */
const PORQUE_ENTRADA: Record<TipoEntrada, string> = {
  extratos: 'Necessário para a contabilidade conciliar o mês',
  notas: 'Necessário para a apuração dos impostos do mês',
  fechamento: 'Esses documentos liberam o fechamento contábil',
  rejeitados: 'Um documento foi rejeitado e precisa ser reenviado',
  'documentacao-pendente': 'A contabilidade pediu documentos extras para concluir o fechamento',
};

/** CTA por tipo de pendência. */
const CTA_ENTRADA: Record<TipoEntrada, string> = {
  extratos: 'Enviar extratos',
  notas: 'Enviar notas',
  fechamento: 'Enviar insumos',
  rejeitados: 'Resolver agora',
  'documentacao-pendente': 'Enviar documentos',
};

function entradaParaPendencia(t: TarefaEntrada, atrasada: boolean): PendenciaVM {
  // Para rejeitados, o motivo real da rejeição é o melhor "por quê".
  const porque =
    t.tipo === 'rejeitados' && t.documentoRejeitado?.motivo
      ? t.documentoRejeitado.motivo
      : t.tipo === 'documentacao-pendente' && t.solicitacao?.assunto
        ? t.solicitacao.assunto
        : PORQUE_ENTRADA[t.tipo];
  const frase = atrasada ? `venceu em ${ddMM(t.prazo)}` : `vence em ${ddMM(t.prazo)}`;
  return {
    id: t.id,
    tipo: t.tipo,
    titulo: TITULO_ENTRADA[t.tipo],
    descricao: `${porque} — ${frase}`,
    prazo: t.prazo,
    prazoLabel: ddMM(t.prazo),
    atrasada,
    ctaLabel: CTA_ENTRADA[t.tipo],
    href: `/tarefas/${t.id}`,
  };
}

function guiaParaPendencia(g: TarefaSaida): PendenciaVM {
  const label = g.prazo ? ddMM(g.prazo) : '—';
  const valorFrase = g.valor != null ? `${formatBRL(g.valor)} · ` : '';
  return {
    id: g.id,
    tipo: 'guia',
    titulo: g.titulo,
    descricao: `Guia para pagamento · ${valorFrase}vencimento ${label}`,
    prazo: g.prazo ?? '',
    prazoLabel: label,
    // Guias não têm status vermelho no GPC — ficam neutras (ver CLAUDE.md).
    atrasada: false,
    valor: g.valor,
    ctaLabel: 'Ver guia',
    href: `/tarefas/${g.id}`,
  };
}

// ---- Acompanhar ----

function fechamentoParaAcompanhar(f: TarefaFechamento): AcompanharVM {
  const movs = f.movimentacoes.length;
  let statusLabel: string;
  let detalhe: string;
  let tom: TomAcompanhar;
  if (f.status === 'concluido') {
    tom = 'success';
    statusLabel = 'Concluído';
    detalhe = f.fechadoEm ? `Concluído em ${ddMM(f.fechadoEm)}` : 'Fechamento concluído';
  } else if (f.status === 'acao-necessaria' || movs > 0) {
    tom = 'warning';
    statusLabel = 'Ação necessária';
    detalhe = `${movs} ${movs > 1 ? 'movimentações aguardam' : 'movimentação aguarda'} você`;
  } else {
    tom = 'neutral';
    statusLabel = 'Em andamento';
    detalhe = f.prazo ? `Conclui dia ${format(parseISO(f.prazo), 'dd')}` : 'Em andamento';
  }
  return {
    id: f.id,
    tipo: 'fechamento',
    titulo: 'Fechamento do mês',
    statusLabel,
    detalhe,
    tom,
    fixo: true,
    href: `/tarefas/${f.id}`,
  };
}

const FOLHA_LABEL: Record<StatusFolha, { statusLabel: string; tom: TomAcompanhar }> = {
  'em-processamento': { statusLabel: 'A BHub prepara', tom: 'info' },
  'aguardando-aprovacao': { statusLabel: 'Pronta para sua aprovação', tom: 'info' },
  aprovado: { statusLabel: 'Aprovada', tom: 'success' },
};

function folhaParaAcompanhar(g: TarefaSaida): AcompanharVM {
  const status = g.statusFolha ?? 'em-processamento';
  const { statusLabel, tom } = FOLHA_LABEL[status];
  const dia = g.prazo ? format(parseISO(g.prazo), 'dd') : '—';
  const detalhe =
    status === 'em-processamento'
      ? `Disponível dia ${dia}`
      : status === 'aguardando-aprovacao'
        ? `Revise e aprove até dia ${dia}`
        : 'Disponível para download';
  return {
    id: g.id,
    tipo: 'folha',
    titulo: 'Folha de pagamento',
    statusLabel,
    detalhe,
    tom,
    fixo: true,
    href: `/tarefas/${g.id}`,
  };
}

// ---- Concluídas ----

const TITULO_CONCLUIDA: Record<TipoEntrada, string> = {
  extratos: 'Extratos bancários enviados',
  notas: 'Notas fiscais enviadas',
  fechamento: 'Insumos do fechamento enviados',
  rejeitados: 'Documento regularizado',
  'documentacao-pendente': 'Documentação enviada',
};

// ---- Selector principal ----

export function getInicioVM(opts: InicioOptions = {}): InicioVM {
  const { isPaga, nomeUsuario = 'Arthur' } = opts;
  const competencia = COMPETENCIA_ATUAL;
  const hoje = HOJE_SIMULADO;

  const entradas = tarefasEntrada.filter((t) => t.competencia === competencia);
  const guias = tarefasSaida.filter(
    (t) => t.competencia === competencia && t.subtipo === 'guia-imposto'
  );

  // ---- Pendências: entradas em aberto + guias não pagas (exclui "calculando") ----
  const pendenciasEntrada = entradas
    .map((t) => ({ t, status: deriveStatusEntrada(t, hoje) }))
    .filter(({ status }) => status !== 'concluida')
    .map(({ t, status }) => entradaParaPendencia(t, status === 'atrasada'));

  const pendenciasGuia = guias
    .filter((g) => g.status !== 'calculando' && !(g.marcadaComoPaga || isPaga?.(g.id)))
    .map((g) => guiaParaPendencia(g));

  const pendencias = [...pendenciasEntrada, ...pendenciasGuia].sort((a, b) => {
    // Atrasadas primeiro; depois por prazo ascendente (ISO ordena cronologicamente).
    if (a.atrasada !== b.atrasada) return a.atrasada ? -1 : 1;
    return a.prazo.localeCompare(b.prazo);
  });

  const proximaAcao = pendencias[0] ?? null;
  const depois = pendencias[1] ?? null;
  const maisPendencias = pendencias.slice(2);
  const totalPendencias = pendencias.length;

  // ---- Subtítulo dinâmico ----
  let subtitulo: string;
  if (totalPendencias === 0) {
    subtitulo = 'Você está em dia — nenhuma pendência este mês.';
  } else {
    const frag = proximaAcao?.atrasada
      ? `uma delas está atrasada desde ${proximaAcao.prazoLabel}`
      : `a mais urgente vence em ${proximaAcao?.prazoLabel}`;
    const corpo =
      totalPendencias === 1
        ? '1 pendência este mês'
        : `${totalPendencias} pendências este mês`;
    subtitulo = `Você tem ${corpo} — ${frag}.`;
  }

  // ---- Para você acompanhar ----
  const acompanhar: AcompanharVM[] = [];
  const fechamento = tarefasFechamento.find((f) => f.competencia === competencia);
  if (fechamento) acompanhar.push(fechamentoParaAcompanhar(fechamento));
  const folha = tarefasSaida.find(
    (g) => g.competencia === competencia && g.subtipo === 'folha-pagamento'
  );
  if (folha) acompanhar.push(folhaParaAcompanhar(folha));
  for (const s of solicitacoesMock) {
    acompanhar.push({
      id: s.id,
      tipo: 'solicitacao',
      titulo: s.titulo,
      statusLabel: s.status === 'em-analise' ? 'Em análise' : s.status,
      detalhe: 'Acompanhamento disponível em breve',
      tom: 'neutral',
      fixo: false,
      href: undefined,
    });
  }

  // ---- Concluídas neste mês ----
  const concluidas: ConcluidaVM[] = entradas
    .filter((t) => deriveStatusEntrada(t, hoje) === 'concluida')
    .map((t) => ({
      id: t.id,
      titulo: TITULO_CONCLUIDA[t.tipo],
      descricao: `Concluída em ${ddMM(t.prazo)}`,
      href: `/tarefas/${t.id}`,
    }));
  // Guias marcadas como pagas também contam como concluídas no mês.
  for (const g of guias) {
    if (g.marcadaComoPaga || isPaga?.(g.id)) {
      concluidas.push({
        id: g.id,
        titulo: g.titulo,
        descricao: 'Guia marcada como paga',
        href: `/tarefas/${g.id}`,
      });
    }
  }

  return {
    saudacao: `Olá, ${nomeUsuario}`,
    totalPendencias,
    subtitulo,
    proximaAcao,
    depois,
    maisPendencias,
    acompanhar,
    concluidas,
  };
}
