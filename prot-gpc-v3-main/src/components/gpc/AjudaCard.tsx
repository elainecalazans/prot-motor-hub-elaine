import { useNavigate } from 'react-router-dom';
import { CirclePlay } from 'lucide-react';
import { cn } from '@bhubai/bhub-design-system';

interface Props {
  /** Texto que descreve o conteúdo de ajuda daquele tipo de tarefa. */
  descricao: string;
  titulo?: string;
  className?: string;
}

/**
 * Card "Central de Ajuda" exibido ao lado dos campos da tarefa. Leva o usuário
 * para a Central de Ajuda com material sobre aquele tipo de tarefa.
 *
 * De/para do Figma (valores crus → tokens do DS):
 *  - bg #f5f5f5            → bg-muted
 *  - radius 16/8           → rounded-xl / rounded-lg
 *  - text-black            → text-foreground
 *  - cinzas de texto       → text-muted-foreground
 *  - border rgba(0,0,0,.08)→ border-border
 *  - ícone circle-play     → lucide CirclePlay
 */
export function AjudaCard({
  descricao,
  titulo = 'Dúvidas sobre essa tarefa?',
  className,
}: Props) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/ajuda')}
      className={cn(
        'group flex w-full flex-col gap-4 rounded-xl bg-muted p-4 text-left transition-colors',
        'hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Central de Ajuda</span>
        <span className="text-xl font-semibold leading-snug tracking-tight text-foreground">
          {titulo}
        </span>
      </div>
      <p className="text-sm leading-normal text-muted-foreground">{descricao}</p>
      <div className="relative aspect-[275/160] w-full overflow-hidden rounded-lg border border-border">
        <img
          src="/images/ajuda-thumb.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <CirclePlay className="h-8 w-8 text-white drop-shadow-md transition-transform group-hover:scale-110" />
        </span>
      </div>
    </button>
  );
}
