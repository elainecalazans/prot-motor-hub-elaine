import { Check, Clock, Loader2 } from 'lucide-react';
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@bhubai/bhub-design-system';
import type { StatusTarefa } from '@/types/gpc';

/**
 * Status de exibição do badge interno da tarefa. Distingue a conclusão dentro
 * do prazo (verde claro, ainda recebe arquivos) da conclusão definitiva após o
 * prazo encerrado (verde sólido).
 */
export type BadgeStatus = StatusTarefa | 'calculando' | 'concluida-no-prazo';

const config: Record<
  Exclude<BadgeStatus, 'concluida-no-prazo'>,
  { variant: 'success' | 'destructive' | 'secondary'; icon: typeof Clock; label: string }
> = {
  concluida: { variant: 'success', icon: Check, label: 'Concluída' },
  atrasada: { variant: 'destructive', icon: Clock, label: 'Prazo encerrado' },
  'nao-iniciada': { variant: 'secondary', icon: Clock, label: 'Dentro do prazo' },
  calculando: { variant: 'secondary', icon: Loader2, label: 'Calculando' },
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  if (status === 'concluida-no-prazo') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="gap-1 border-success bg-success/10 text-success"
            >
              <Check className="h-3 w-3" />
              Dentro do prazo
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px]">
            Você pode continuar enviando arquivos até a data limite.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const { variant, icon: Icon, label } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className={status === 'calculando' ? 'h-3 w-3 animate-spin' : 'h-3 w-3'} />
      {label}
    </Badge>
  );
}
