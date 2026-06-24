import { useEffect, useMemo, useRef } from 'react';
import { addMonths, format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Calendar, IconButton } from '@bhubai/bhub-design-system';
import type { Tarefa, Competencia } from '@/types/gpc';
import { parseCompetencia } from '@/lib/competencia';
import { COMPETENCIA_ATUAL, HOJE_SIMULADO } from '@/mocks/seed';

// Limites de navegação do calendário.
//  - Passado: janeiro do ano anterior ao mês vigente (2025 inteiro de histórico).
//  - Futuro: +3 meses após o vigente (mar–mai/2026). Além disso a seta desabilita.
const INICIO_NAVEGACAO = new Date(parseCompetencia(COMPETENCIA_ATUAL).getFullYear() - 1, 0, 1);
const FIM_NAVEGACAO = addMonths(parseCompetencia(COMPETENCIA_ATUAL), 3);

interface Props {
  competencia: Competencia;
  tarefas: Tarefa[];
  selected: Date | null;
  onSelect: (date: Date | null) => void;
  onMonthChange?: (date: Date) => void;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function CompetenciaCalendar({
  competencia,
  tarefas,
  selected,
  onSelect,
  onMonthChange,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const diasComTarefa = useMemo(
    () =>
      tarefas
        .map((t) => ('prazo' in t && t.prazo ? parseISO(t.prazo) : null))
        .filter((d): d is Date => d !== null),
    [tarefas]
  );

  const month = parseCompetencia(competencia);

  // Hoje simulado vem da fonte única do protótipo (ver src/mocks/seed.ts).
  const today = HOJE_SIMULADO;

  const isEventDate = (d: Date) => diasComTarefa.some((dt) => isSameDay(dt, d));

  // Deseleciona quando o usuário clica fora do calendário
  useEffect(() => {
    if (!selected) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        onSelect(null);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [selected, onSelect]);

  const diasNaoSelecionados = useMemo(
    () => diasComTarefa.filter((d) => !selected || !isSameDay(d, selected)),
    [diasComTarefa, selected]
  );

  const diasSelecionados = useMemo(
    () =>
      selected && diasComTarefa.some((d) => isSameDay(d, selected)) ? [selected] : [],
    [diasComTarefa, selected]
  );

  return (
    <div
      ref={wrapperRef}
      className="overflow-hidden rounded-2xl border border-border bg-white p-4"
    >
      <Calendar
        mode="single"
        locale={ptBR}
        month={month}
        today={today}
        startMonth={INICIO_NAVEGACAO}
        endMonth={FIM_NAVEGACAO}
        onMonthChange={onMonthChange}
        selected={selected ?? undefined}
        // Só os dias com tarefa/entregável são acionáveis (destacam o card
        // correspondente). Os demais ficam desabilitados — sem clique, foco nem
        // hover — para não passarem a ideia de que são clicáveis.
        disabled={(date) => !isEventDate(date)}
        onSelect={(date) => {
          if (date && isEventDate(date)) onSelect(date);
          else onSelect(null);
        }}
        modifiers={{
          eventoNaoSelecionado: diasNaoSelecionados,
          eventoSelecionado: diasSelecionados,
        }}
        modifiersClassNames={{
          eventoNaoSelecionado:
            '[&_button]:!font-semibold [&_button]:!text-mizu-flow-bold [&_button]:relative [&_button]:after:absolute [&_button]:after:left-1/2 [&_button]:after:bottom-1 [&_button]:after:h-1 [&_button]:after:w-1 [&_button]:after:-translate-x-1/2 [&_button]:after:rounded-full [&_button]:after:bg-mizu-flow-bold',
          eventoSelecionado:
            '[&_button]:!font-semibold [&_button]:!bg-mizu-flow-bold [&_button]:!text-primary-foreground [&_button]:!rounded-lg',
        }}
        showOutsideDays
        captionLayout="label"
        className="w-full [--cell-size:--spacing(12)]"
        components={{
          PreviousMonthButton: ({ className: _ignored, ...props }) => (
            <IconButton {...props} size="sm" variant="outline" aria-label="Mês anterior">
              <ArrowLeft className="size-3" />
            </IconButton>
          ),
          NextMonthButton: ({ className: _ignored, ...props }) => (
            <IconButton {...props} size="sm" variant="outline" aria-label="Próximo mês">
              <ArrowRight className="size-3" />
            </IconButton>
          ),
        }}
        formatters={{
          formatCaption: (date) => capitalize(format(date, 'MMMM yyyy', { locale: ptBR })),
          formatWeekdayName: (weekday) =>
            format(weekday, 'EEEEE', { locale: ptBR }).toUpperCase(),
        }}
        classNames={{
          root: 'w-full',
          months: 'flex flex-col gap-4 w-full relative',
          month: 'flex flex-col gap-4 w-full',
          nav: 'flex items-center justify-between w-full absolute top-0 inset-x-0',
          button_previous: '',
          button_next: '',
          month_caption: 'flex items-center justify-center h-8 w-full px-10',
          caption_label: 'text-sm font-semibold text-[#0a0a0a] select-none',
          weekdays: 'flex w-full',
          weekday:
            'text-[#737373] flex-1 font-normal text-[12px] select-none py-1 text-center',
          week: 'flex w-full',
          day: 'relative flex-1 aspect-square text-center select-none',
          today:
            // !text para vencer o estilo de disabled: hoje (16/02) não tem
            // evento, então cai como desabilitado, mas deve seguir visível.
            '[&_button]:bg-[#f5f5f5] [&_button]:rounded-lg [&_button]:font-semibold [&_button]:!text-[#0a0a0a]',
          // Dias sem evento: inertes (sem hover/cursor/clique). Texto no token
          // muted-foreground — legível, mas claramente não-acionável.
          disabled: '[&_button]:pointer-events-none [&_button]:text-muted-foreground',
        }}
      />
    </div>
  );
}
