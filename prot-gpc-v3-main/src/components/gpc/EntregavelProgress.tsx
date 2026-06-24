import { FileText, TriangleAlert } from 'lucide-react';

interface Props {
  /** Entregáveis prontos para o cliente usar agora (baixar/pagar/ver final). */
  disponiveis: number;
  total: number;
  /** Entregáveis que dependem de uma ação do cliente agora. */
  aguardando?: number;
}

/**
 * Resumo dos entregáveis no cabeçalho do bloco: quantos já estão disponíveis e
 * quantos aguardam uma ação do cliente. Mesma gramática do indicador de tarefas
 * (`TaskProgress`): ícone + número + rótulo, com divisória entre os dois.
 */
export function EntregavelProgress({ disponiveis, total, aguardando = 0 }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-neutral-600" />
        <span className="text-[12px] font-semibold leading-4 text-[#0a0a0a]">
          {disponiveis}/{total}
        </span>
        <span className="text-[12px] font-normal leading-4 text-[#0a0a0a]">
          {disponiveis === 1 ? 'disponível' : 'disponíveis'}
        </span>
      </div>
      {aguardando > 0 ? (
        <>
          <span aria-hidden className="h-3.5 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 text-warning-text" />
            <span className="text-[12px] font-semibold leading-4 text-[#0a0a0a]">
              {aguardando}
            </span>
            <span className="text-[12px] font-normal leading-4 text-[#0a0a0a]">
              {aguardando > 1 ? 'aguardam' : 'aguarda'} você
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
