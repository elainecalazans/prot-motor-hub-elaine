import { Zap } from 'lucide-react';
import { cn } from '@bhubai/bhub-design-system';
import type { AutomacaoEstado } from '@/types/gpc';
import { TaskIconTooltip } from './TaskIconTooltip';

export function AutomacaoBadge({
  estado,
  onClick,
  qtdAutomatizadas,
}: {
  estado: AutomacaoEstado;
  /** Abre o fluxo de configuração da automação (Open Finance). Opcional: a tag
   *  já comunica clicabilidade pelo hover mesmo sem ação conectada. */
  onClick?: () => void;
  /** Nº de contas automatizadas. Só usado no estado 'ativa', para o tooltip. */
  qtdAutomatizadas?: number;
}) {
  if (estado === 'nao-elegivel') return null;

  // Estado final: automação já configurada (≥1 conta). Roxo sólido. Quando
  // recebe onClick, vira botão (reabre o modal para gerenciar contas) com hover;
  // sem onClick, é apenas um indicador. Em ambos os casos ganha tooltip com a
  // contagem de contas automatizadas.
  if (estado === 'ativa') {
    const base =
      'inline-flex items-center gap-1 rounded-lg bg-automacao px-2 py-0.5 text-xs font-semibold text-white';
    const conteudo = (
      <>
        <Zap className="h-3 w-3" />
        Automático
      </>
    );

    const badge = onClick ? (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          base,
          'cursor-pointer transition-colors hover:bg-automacao-strong',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-automacao/40'
        )}
      >
        {conteudo}
      </button>
    ) : (
      <span className={base}>{conteudo}</span>
    );

    if (qtdAutomatizadas && qtdAutomatizadas > 0) {
      const texto = `${qtdAutomatizadas} ${
        qtdAutomatizadas === 1 ? 'conta automatizada' : 'contas automatizadas'
      }`;
      return <TaskIconTooltip content={texto}>{badge}</TaskIconTooltip>;
    }
    return badge;
  }

  // "Automatizar": CTA para habilitar a automação. O Figma e o DS não preveem
  // hover para esta tag, mas como ela é clicável criamos um aqui — o usuário
  // precisa perceber que dá pra interagir.
  return (
    <button
      type="button"
      onClick={onClick}
      title="Automatizar esta tarefa"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-dashed px-2 py-0.5 text-xs font-semibold',
        'border-automacao bg-automacao-subtle text-automacao',
        'cursor-pointer transition-colors',
        'hover:border-automacao-strong hover:bg-automacao-muted hover:text-automacao-strong',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-automacao/40'
      )}
    >
      <Zap className="h-3 w-3" />
      Automatizar
    </button>
  );
}
