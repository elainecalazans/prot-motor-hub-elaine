import { deriveStatusEntrada } from '@/lib/status';
import { tarefasEntrada, tarefasFechamento, tarefasSaida } from '@/mocks/seed';
import type { Competencia } from '@/types/gpc';

/**
 * Conta os itens "em aberto" de uma competência:
 *  - tarefas de entrada ainda não concluídas (status ≠ 'concluida'); +
 *  - entregáveis que aguardam uma ação do cliente: fechamento com movimentações
 *    a confirmar e folha de pagamento aguardando aprovação.
 *
 * É a mesma definição dos blocos da Home (entradas em aberto +
 * `entregaveisAguardando`). Guias prontas para baixar NÃO entram — já estão
 * disponíveis e não pedem ação. Usado no badge da sidebar, sempre sobre o mês
 * vigente do protótipo (COMPETENCIA_ATUAL). Em 02/2026: 3 entradas + 2
 * entregáveis = 5.
 */
export function contarTarefasAbertas(competencia: Competencia, hoje: Date): number {
  const entradasAbertas = tarefasEntrada.filter(
    (t) =>
      t.competencia === competencia &&
      !t.cancelada &&
      deriveStatusEntrada(t, hoje) !== 'concluida'
  ).length;

  const fechamentosPendentes = tarefasFechamento.filter(
    (f) => f.competencia === competencia && f.movimentacoes.length > 0
  ).length;

  const folhasAguardando = tarefasSaida.filter(
    (g) =>
      g.competencia === competencia &&
      g.subtipo === 'folha-pagamento' &&
      g.statusFolha === 'aguardando-aprovacao'
  ).length;

  return entradasAbertas + fechamentosPendentes + folhasAguardando;
}
