/**
 * Solicitações (MOCK — não existem no modelo de dados real do protótipo).
 *
 * "Solicitações" é uma área futura do Hub: hoje o item do sidebar está
 * desabilitado e não há rota, tipos ou store de domínio. Na Página inicial elas
 * aparecem de forma ILUSTRATIVA, dentro de "Para você acompanhar", apenas para
 * validar o conceito de visão única do Hub — são somente leitura e **não
 * navegáveis**. Sem persistência: vivem em memória e somem ao recarregar.
 *
 * Quando a área de Solicitações existir de fato, este mock deve dar lugar à
 * fonte real (e os cards passam a linkar para a interna de cada solicitação).
 */
export type StatusSolicitacao = 'em-analise' | 'concluida' | 'recusada';

export interface SolicitacaoMock {
  id: string;
  titulo: string;
  status: StatusSolicitacao;
  /** Data de abertura (ISO). */
  abertaEm: string;
}

export const solicitacoes: SolicitacaoMock[] = [
  { id: 'sol-1', titulo: 'Admissão de funcionário', status: 'em-analise', abertaEm: '2026-02-12' },
  { id: 'sol-2', titulo: 'Férias de funcionário', status: 'em-analise', abertaEm: '2026-02-14' },
];
