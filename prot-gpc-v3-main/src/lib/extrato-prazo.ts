import { isAfter, isWeekend, parseISO, startOfDay } from 'date-fns';

/**
 * Níveis de urgência para o prazo de envio de extrato.
 *
 *  ok       — prazo distante, sem alerta.
 *  lembrete — ≤ 3 dias úteis restantes (alerta âmbar, tom amigável).
 *  urgente  — ≤ 1 dia útil restante (alerta vermelho, tom incisivo).
 *  vencido  — prazo já passou (estado atrasada — coberto pelo shell existente).
 */
export type UrgenciaExtrato = 'ok' | 'lembrete' | 'urgente' | 'vencido';

/**
 * Conta quantos dias úteis (seg–sex) existem entre `inicio` (exclusive) e
 * `fim` (inclusive). Exclui o dia de hoje para refletir dias *restantes*,
 * não dias *correntes*.
 */
function diasUteisRestantes(inicio: Date, fim: Date): number {
  let count = 0;
  // Começa no dia seguinte ao início (hoje não conta como dia restante).
  const cursor = startOfDay(new Date(inicio));
  cursor.setDate(cursor.getDate() + 1);
  const alvo = startOfDay(fim);
  while (!isAfter(cursor, alvo)) {
    if (!isWeekend(cursor)) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/**
 * Deriva o nível de urgência do prazo de extrato.
 *
 * @param prazo  - data ISO do prazo da tarefa (ex.: "2026-02-19")
 * @param hoje   - data de referência simulada
 * @param arquivos - quantidade de arquivos já enviados; se > 0, não há urgência
 */
export function derivarUrgenciaExtrato(
  prazo: string,
  hoje: Date,
  arquivos: number
): UrgenciaExtrato {
  if (arquivos > 0) return 'ok';

  const prazoDate = startOfDay(parseISO(prazo));
  const hojeDate = startOfDay(hoje);

  if (isAfter(hojeDate, prazoDate)) return 'vencido';

  const diasRestantes = diasUteisRestantes(hojeDate, prazoDate);

  if (diasRestantes <= 1) return 'urgente';
  if (diasRestantes <= 3) return 'lembrete';
  return 'ok';
}
