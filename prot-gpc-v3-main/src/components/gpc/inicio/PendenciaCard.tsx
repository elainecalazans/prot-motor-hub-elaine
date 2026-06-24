import { Clock } from 'lucide-react';
import { Badge, Button } from '@bhubai/bhub-design-system';
import type { PendenciaVM } from '@/lib/inicio';

/**
 * Card secundário de pendência: a "Depois" e as linhas reveladas em "Mais N".
 * Superfície branca/neutra (prioridade menor que a Próxima ação). O badge
 * comunica a prioridade em texto — "Atrasada" (vermelho) ou "Depois" (cinza) —
 * nunca só por cor. CTA outline leva à interna real da tarefa/guia.
 */
export function PendenciaCard({
  pendencia,
  onAbrir,
}: {
  pendencia: PendenciaVM;
  onAbrir: (href: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          {pendencia.atrasada ? (
            <Badge variant="destructive" className="gap-1">
              <Clock className="h-3 w-3" />
              Atrasada
            </Badge>
          ) : (
            <Badge variant="secondary">Depois</Badge>
          )}
        </div>
        <h4 className="text-sm font-semibold leading-5 text-foreground">{pendencia.titulo}</h4>
        <p className="text-sm leading-5 text-muted-foreground">{pendencia.descricao}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 self-start sm:self-auto"
        onClick={() => onAbrir(pendencia.href)}
      >
        {pendencia.ctaLabel}
      </Button>
    </div>
  );
}
