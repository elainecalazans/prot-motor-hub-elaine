import { Clock } from 'lucide-react';
import { Badge, Button, cn } from '@bhubai/bhub-design-system';
import type { PendenciaVM } from '@/lib/inicio';

/**
 * Card de destaque da Página inicial: a "Próxima ação" — a pendência mais
 * urgente do mês. Superfície azul + borda `mizu-flow-bold` (mesmo token do
 * "selecionado" do calendário) = "este é o foco agora". O status nunca fica só
 * na cor: badge "Próxima ação" + badge "Atrasada" (quando for o caso) carregam
 * o significado em texto. CTA verde (`variant="success"`) leva à interna real.
 */
export function ProximaAcaoCard({
  pendencia,
  onAbrir,
}: {
  pendencia: PendenciaVM;
  onAbrir: (href: string) => void;
}) {
  return (
    <div className="rounded-xl border border-mizu-flow-bold bg-blue-50 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-transparent bg-mizu-flow-bold text-white">
              Próxima ação
            </Badge>
            {pendencia.atrasada ? (
              <Badge variant="destructive" className="gap-1">
                <Clock className="h-3 w-3" />
                Atrasada
              </Badge>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold leading-6 text-foreground">{pendencia.titulo}</h3>
          <p className="text-sm leading-5 text-muted-foreground">{pendencia.descricao}</p>
        </div>
        <Button
          variant="success"
          size="lg"
          className={cn('shrink-0', 'max-sm:w-full')}
          onClick={() => onAbrir(pendencia.href)}
        >
          {pendencia.ctaLabel}
        </Button>
      </div>
    </div>
  );
}
