import { useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '@bhubai/bhub-design-system';

interface Props {
  /** Recurso que falhou ao carregar, ex.: "suas tarefas" / "seus entregáveis". */
  recurso: string;
}

/**
 * Estado de ERRO de carregamento dos blocos da Home — mesma diagramação do
 * BlocoVazio, porém com tom de alerta, mensagem de falha e botão "Recarregar".
 *
 * Protótipo: a falha é simulada e persistente. O "Recarregar" dá o feedback de
 * tentativa (spinner) e, ao fim, o erro permanece (backend "indisponível"),
 * reforçado por um toast. O estado de carregamento é local a cada bloco.
 */
export function BlocoErro({ recurso }: Props) {
  const [recarregando, setRecarregando] = useState(false);

  const recarregar = () => {
    setRecarregando(true);
    window.setTimeout(() => {
      setRecarregando(false);
      toast.error('Não foi possível carregar. Tente novamente em instantes.');
    }, 1100);
  };

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-destructive/30 bg-white px-6 py-10 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm font-semibold text-foreground">Não foi possível carregar {recurso}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Tivemos uma falha ao carregar os dados deste mês. Verifique sua conexão e tente novamente.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-1"
        onClick={recarregar}
        disabled={recarregando}
      >
        <RefreshCw className={`h-4 w-4 ${recarregando ? 'animate-spin' : ''}`} />
        {recarregando ? 'Recarregando…' : 'Recarregar'}
      </Button>
    </div>
  );
}
