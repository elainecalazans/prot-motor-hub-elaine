import { isAfter, parseISO, startOfDay } from 'date-fns';
import type { StatusTarefa, TarefaEntrada } from '@/types/gpc';

type EntradaStatusInput = Pick<TarefaEntrada, 'prazo' | 'arquivos' | 'semEnvio'>;

/**
 * Deriva o status de uma tarefa de entrada a partir de prazo + arquivos + hoje.
 *
 * Regra única (3 status, sem intermediário):
 *  - Verde   (concluida):   enviou arquivos OU confirmou que não tem envio.
 *  - Vermelho (atrasada):   prazo já vencido e ainda sem envio.
 *  - Cinza   (nao-iniciada): prazo ainda em aberto e sem envio.
 *
 * O dia do prazo é inclusivo: enquanto hoje <= prazo, a tarefa segue no prazo.
 */
export function deriveStatusEntrada(
  tarefa: EntradaStatusInput,
  hoje: Date
): StatusTarefa {
  if (tarefa.arquivos > 0 || tarefa.semEnvio) return 'concluida';
  const prazo = startOfDay(parseISO(tarefa.prazo));
  if (isAfter(startOfDay(hoje), prazo)) return 'atrasada';
  return 'nao-iniciada';
}
