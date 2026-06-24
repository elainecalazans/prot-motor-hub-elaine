import { parse, format, addMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Competencia } from '@/types/gpc';

export function parseCompetencia(c: Competencia): Date {
  return parse(c, 'yyyy-MM', new Date());
}

export function formatCompetencia(c: Competencia): string {
  return format(parseCompetencia(c), 'MMMM \'de\' yyyy', { locale: ptBR });
}

export function formatMesCompetencia(c: Competencia): string {
  return format(parseCompetencia(c), 'MMMM', { locale: ptBR });
}

export function toCompetencia(date: Date): Competencia {
  return format(date, 'yyyy-MM') as Competencia;
}

export function navegarCompetencia(c: Competencia, delta: number): Competencia {
  return toCompetencia(addMonths(parseCompetencia(c), delta));
}

export { startOfMonth, endOfMonth, isSameMonth };
