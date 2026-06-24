import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@bhubai/bhub-design-system';

/**
 * Ícone de informação com tooltip ao lado de um título de seção. Explica, em
 * linguagem do cliente, o que é aquele bloco. O gatilho é um botão para
 * funcionar também por teclado (foco), não só no hover do mouse.
 */
export function InfoHint({ content, label }: { content: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mizu-flow-bold/40"
        >
          <Info className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="gpc-status-tooltip">
        <span className="block max-w-64 text-wrap text-left">{content}</span>
      </TooltipContent>
    </Tooltip>
  );
}
