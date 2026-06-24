import { Check, Clock } from 'lucide-react';
import { cn } from '@bhubai/bhub-design-system';
import type { StatusTarefa } from '@/types/gpc';
import { STATUS_TOOLTIP } from '@/lib/status-tooltips';
import { TaskIconTooltip } from './TaskIconTooltip';

type Status = StatusTarefa | 'calculando';

const config: Record<Status, { icon: typeof Clock; bg: string; fg: string; label: string }> = {
  'nao-iniciada': {
    icon: Clock,
    bg: 'bg-[#f5f5f5]',
    fg: 'text-neutral-600',
    label: 'Não iniciada',
  },
  concluida: {
    icon: Check,
    bg: 'bg-emerald-50',
    fg: 'text-emerald-600',
    label: 'Concluída',
  },
  atrasada: {
    icon: Clock,
    bg: 'bg-rose-50',
    fg: 'text-rose-600',
    label: 'Atrasada',
  },
  calculando: {
    icon: Clock,
    bg: 'bg-[#f5f5f5]',
    fg: 'text-neutral-600',
    label: 'Calculando',
  },
};

const tooltipByStatus: Partial<Record<Status, string>> = {
  'nao-iniciada': STATUS_TOOLTIP.pendente,
  concluida: STATUS_TOOLTIP.concluida,
  atrasada: STATUS_TOOLTIP.vencida,
};

export function StatusIcon({ status, className }: { status: Status; className?: string }) {
  const { icon: Icon, bg, fg, label } = config[status];
  const tooltip = tooltipByStatus[status];

  return (
    <TaskIconTooltip content={tooltip}>
      <span
        role="img"
        aria-label={label}
        className={cn(
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          bg,
          fg,
          className
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
    </TaskIconTooltip>
  );
}
