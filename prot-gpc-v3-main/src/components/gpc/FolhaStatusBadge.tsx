import { Check, Clock, Loader2 } from 'lucide-react';
import { Badge, cn } from '@bhubai/bhub-design-system';
import type { StatusFolha } from '@/types/gpc';

/**
 * Badge de status da Folha de pagamento. Reaproveita as variantes semânticas do
 * Badge do DS (sem cor crua): cinza enquanto a BHub processa, âmbar quando
 * aguarda a aprovação do cliente e verde quando aprovada. O âmbar usa o peso
 * subtle (fundo claro + texto warning) — o badge bold do título do bloco é quem
 * carrega o destaque; dentro do card o badge é apenas um marcador discreto.
 */
const config: Record<
  StatusFolha,
  {
    variant: 'secondary' | 'warning' | 'success';
    icon: typeof Clock;
    label: string;
    spin?: boolean;
    className?: string;
  }
> = {
  'em-processamento': {
    variant: 'secondary',
    icon: Loader2,
    label: 'Em processamento',
    spin: true,
  },
  'aguardando-aprovacao': {
    variant: 'warning',
    icon: Clock,
    label: 'Aguardando aprovação',
    className: 'border-transparent bg-warning-subtle text-warning-text',
  },
  aprovado: {
    variant: 'success',
    icon: Check,
    label: 'Aprovada',
  },
};

export function FolhaStatusBadge({ status }: { status: StatusFolha }) {
  const { variant, icon: Icon, label, spin, className } = config[status];
  return (
    <Badge variant={variant} className={cn('gap-1', className)}>
      <Icon className={spin ? 'h-3 w-3 animate-spin' : 'h-3 w-3'} />
      {label}
    </Badge>
  );
}
