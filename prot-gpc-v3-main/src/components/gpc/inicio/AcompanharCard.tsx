import type { LucideIcon } from 'lucide-react';
import { FileText, Wallet, Inbox } from 'lucide-react';
import { Badge, cn } from '@bhubai/bhub-design-system';
import type { AcompanharTipo, AcompanharVM, TomAcompanhar } from '@/lib/inicio';

/**
 * Tile de "Para você acompanhar": o que está em andamento e o que a BHub está
 * preparando este mês. O tom (cor) DERIVA do estado real do entregável — verde
 * em dia, azul informativo ("a BHub prepara"), âmbar quando depende de você,
 * neutro quando é só leitura. O significado vai sempre em texto (statusLabel +
 * detalhe), nunca só na cor.
 *
 * Navegável apenas quando há `href` (fechamento/folha → interna real). As
 * Solicitações são ilustrativas (mock) e renderizam estáticas, não focáveis.
 */
const TOM: Record<TomAcompanhar, { card: string; chip: string }> = {
  info: { card: 'border-blue-200 bg-blue-50', chip: 'bg-blue-100 text-blue-700' },
  warning: { card: 'border-amber-200 bg-amber-50', chip: 'bg-amber-100 text-amber-700' },
  success: { card: 'border-emerald-200 bg-emerald-50', chip: 'bg-emerald-100 text-emerald-700' },
  neutral: { card: 'border-border bg-white', chip: 'bg-muted text-neutral-600' },
};

const ICONE: Record<AcompanharTipo, LucideIcon> = {
  fechamento: FileText,
  folha: Wallet,
  solicitacao: Inbox,
};

export function AcompanharCard({
  item,
  onAbrir,
}: {
  item: AcompanharVM;
  onAbrir: (href: string) => void;
}) {
  const tom = TOM[item.tom];
  const Icon = ICONE[item.tipo];
  const clicavel = !!item.href;

  return (
    <div
      role={clicavel ? 'button' : undefined}
      tabIndex={clicavel ? 0 : undefined}
      onClick={clicavel ? () => onAbrir(item.href!) : undefined}
      onKeyDown={
        clicavel
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAbrir(item.href!);
              }
            }
          : undefined
      }
      aria-label={clicavel ? `${item.titulo} — ${item.statusLabel}` : undefined}
      className={cn(
        'flex h-full flex-col gap-3 rounded-xl border p-4 transition-colors',
        tom.card,
        clicavel
          ? 'cursor-pointer hover:brightness-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mizu-flow-bold/40'
          : 'cursor-default'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            tom.chip
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        {item.fixo ? (
          <Badge variant="secondary" className="text-[11px]">
            fixo
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-semibold leading-5 text-foreground">{item.titulo}</h4>
        <p className="text-sm font-medium leading-5 text-foreground">{item.statusLabel}</p>
        <p className="text-xs leading-4 text-muted-foreground">{item.detalhe}</p>
      </div>
    </div>
  );
}
