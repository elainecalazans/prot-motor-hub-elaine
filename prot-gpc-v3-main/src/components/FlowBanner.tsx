import { useState } from 'react';
import { X, Compass } from 'lucide-react';
import type { FlowMeta } from '@/lib/flow-meta';

interface Props {
  meta: FlowMeta;
}

/**
 * Banner contextual exibido quando o usuário chega ao app via hub-index.html
 * com o parâmetro `?flow=`. Identifica o fluxo demonstrado e orienta onde
 * focar a atenção — sem alterar nenhum componente existente.
 */
export function FlowBanner({ meta }: Props) {
  const [visivel, setVisivel] = useState(true);
  if (!visivel) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-3 border-b px-12 py-3"
      style={{ background: '#FEF0F1', borderColor: '#FADADC' }}
    >
      <Compass
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: '#F25461' }}
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-semibold" style={{ color: '#B91C1C' }}>
          {meta.titulo}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
          {meta.descricao}{' '}
          <span className="font-medium" style={{ color: '#374151' }}>
            {meta.dica}
          </span>
        </p>
      </div>
      <button
        type="button"
        onClick={() => setVisivel(false)}
        className="shrink-0 rounded p-0.5 transition-colors hover:bg-black/5"
        aria-label="Fechar orientação de fluxo"
      >
        <X className="h-3.5 w-3.5" style={{ color: '#9CA3AF' }} />
      </button>
    </div>
  );
}
