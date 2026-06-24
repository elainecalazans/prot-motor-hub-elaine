import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import {
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  TooltipProvider,
} from '@bhubai/bhub-design-system';
import { getInicioVM } from '@/lib/inicio';
import { useGuiasPagas } from '@/hooks/useGuiasPagas';
import { SectionTable } from '@/components/gpc/SectionTable';
import { ProximaAcaoCard } from '@/components/gpc/inicio/ProximaAcaoCard';
import { PendenciaCard } from '@/components/gpc/inicio/PendenciaCard';
import { AcompanharCard } from '@/components/gpc/inicio/AcompanharCard';
import { BannerEventual } from '@/components/gpc/inicio/BannerEventual';

function SecaoTitulo({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold leading-6 text-foreground">{children}</h2>;
}

export function PaginaInicial() {
  const navigate = useNavigate();
  const { isPaga } = useGuiasPagas();
  const vm = useMemo(() => getInicioVM({ isPaga }), [isPaga]);
  const abrir = (href: string) => navigate(href);

  const { totalPendencias, proximaAcao, depois, maisPendencias, acompanhar, concluidas } = vm;
  const semPendencias = totalPendencias === 0;

  return (
    <TooltipProvider>
      <div className="mx-auto flex w-full max-w-[1310px] flex-col gap-8">
        {/* Saudação + resumo do mês em uma frase */}
        <header className="flex max-w-[680px] flex-col gap-1 pt-2">
          <h1 className="text-2xl font-semibold leading-8 text-foreground">{vm.saudacao}</h1>
          <p className="text-base leading-6 text-muted-foreground">{vm.subtitulo}</p>
        </header>

        {/* Bloco 1 — Pendências do mês */}
        <SectionTable
          title={<SecaoTitulo>Pendências do mês</SecaoTitulo>}
          info="O que depende de você este mês: documentos a enviar, regularizações e guias a pagar. Resolva por aqui ou abra cada item para ver os detalhes."
          infoLabel="Sobre as pendências"
          action={
            semPendencias ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                Tudo em dia
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                {totalPendencias} {totalPendencias > 1 ? 'pendências' : 'pendência'}
              </span>
            )
          }
        >
          {semPendencias ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-white px-6 py-10 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-foreground">Tudo em dia por aqui</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Você não tem nenhuma pendência este mês. A gente te avisa assim que algo novo
                aparecer.
              </p>
            </div>
          ) : (
            <>
              {proximaAcao ? <ProximaAcaoCard pendencia={proximaAcao} onAbrir={abrir} /> : null}
              {depois ? <PendenciaCard pendencia={depois} onAbrir={abrir} /> : null}
              {maisPendencias.length > 0 ? (
                <Collapsible>
                  <CollapsibleTrigger className="group flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mizu-flow-bold/40">
                    Mais {maisPendencias.length}{' '}
                    {maisPendencias.length > 1 ? 'pendências' : 'pendência'}
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="flex flex-col gap-4 pt-4">
                    {maisPendencias.map((p) => (
                      <PendenciaCard key={p.id} pendencia={p} onAbrir={abrir} />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : null}
            </>
          )}
        </SectionTable>

        {/* Bloco 2 — Para você acompanhar */}
        <SectionTable
          title={<SecaoTitulo>Para você acompanhar</SecaoTitulo>}
          info="O que a BHub está preparando e o que segue em andamento este mês. Você não precisa fazer nada agora — é só acompanhar."
          infoLabel="Sobre o acompanhamento"
        >
          {acompanhar.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {acompanhar.map((item) => (
                <AcompanharCard key={item.id} item={item} onAbrir={abrir} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-white px-6 py-8 text-center">
              <p className="text-sm font-semibold text-foreground">Nada para acompanhar agora</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Quando a BHub começar a preparar algo para você, aparece aqui.
              </p>
            </div>
          )}

          {concluidas.length > 0 ? (
            <Collapsible>
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mizu-flow-bold/40">
                <span className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  Concluídas neste mês
                </span>
                <Badge variant="secondary">{concluidas.length}</Badge>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-1 pt-2">
                {concluidas.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => abrir(c.href)}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mizu-flow-bold/40"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">{c.titulo}</span>
                      <span className="truncate text-xs text-muted-foreground">{c.descricao}</span>
                    </span>
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </SectionTable>

        {/* Bloco 3 — Banners eventuais (liberdade criativa) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BannerEventual
            theme="certificado"
            titulo="Renove seu certificado digital"
            descricao="Seu certificado vence em 40 dias. Renove para não interromper o envio de notas fiscais."
            ctaLabel="Renovar"
          />
          <BannerEventual
            theme="cadastral"
            titulo="Atualização cadastral"
            descricao="Confirme se seus contatos estão atualizados para não perder avisos importantes da BHub."
            ctaLabel="Saiba mais"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
