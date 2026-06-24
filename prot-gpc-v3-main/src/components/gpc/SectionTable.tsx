import { Children, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@bhubai/bhub-design-system';
import { InfoHint } from './InfoHint';

interface Props {
  title: React.ReactNode;
  /** Texto explicativo do bloco, exibido num tooltip ao lado do título. */
  info?: string;
  /** Rótulo acessível do ícone de informação (lido por leitores de tela). */
  infoLabel?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /**
   * Quando definido, o bloco exibe no máximo `maxVisible` itens e revela o
   * restante em grupos do mesmo tamanho, através de um botão "Ver mais"
   * (e "Ver menos" para recolher). Sem esta prop, todos os filhos são
   * renderizados de uma vez (comportamento padrão).
   */
  maxVisible?: number;
  /** Substantivo dos itens, usado na copy do botão ("Ver mais 6 tarefas"). */
  itemNoun?: { singular: string; plural: string };
}

export function SectionTable({
  title,
  info,
  infoLabel,
  action,
  children,
  className,
  maxVisible,
  itemNoun,
}: Props) {
  const itens = Children.toArray(children);
  const total = itens.length;
  const paginavel = maxVisible != null && total > maxVisible;
  // Tamanho do grupo revelado a cada clique (e quantidade inicial visível).
  const passo = maxVisible ?? total;
  const [visiveis, setVisiveis] = useState(passo);

  const exibidos = paginavel ? itens.slice(0, Math.min(visiveis, total)) : itens;
  const restantes = total - exibidos.length;
  const proximoGrupo = Math.min(passo, restantes);
  const expandido = paginavel && restantes === 0;

  const noun = (n: number) =>
    n === 1 ? itemNoun?.singular ?? 'item' : itemNoun?.plural ?? 'itens';

  return (
    <section
      className={cn(
        'flex flex-col gap-0.5 overflow-hidden rounded-xl border border-border bg-[#f5f5f5] shadow-[0_1px_2px_0_rgba(10,13,18,0.05)]',
        className
      )}
    >
      <header className="flex items-center justify-between px-5 pb-2 pt-3">
        <div className="flex items-center gap-2">
          {title}
          {info ? (
            <InfoHint content={info} label={infoLabel ?? 'Mais informações sobre este bloco'} />
          ) : null}
        </div>
        {action}
      </header>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-6 shadow-[0_1px_1px_0_rgba(10,13,18,0.05)]">
        {exibidos}
        {paginavel ? (
          <button
            type="button"
            onClick={() => setVisiveis((v) => (expandido ? passo : v + passo))}
            className="group flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mizu-flow-bold/40"
          >
            {expandido ? 'Ver menos' : `Ver mais ${proximoGrupo} ${noun(proximoGrupo)}`}
            <ChevronDown className={cn('h-4 w-4 transition-transform', expandido && 'rotate-180')} />
          </button>
        ) : null}
      </div>
    </section>
  );
}
