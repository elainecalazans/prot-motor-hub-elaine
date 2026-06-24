import { Check, Clock } from 'lucide-react';

interface Props {
  concluidas: number;
  total: number;
  /** Tarefas de entrada com prazo vencido e ainda sem envio. */
  vencidas?: number;
}

/**
 * Resumo das tarefas de entrada no cabeçalho do bloco: quantas já foram
 * concluídas e quantas estão vencidas. Mesma gramática do indicador de
 * entregáveis (ícone colorido + número + rótulo, sem barra) — a cor fica só no
 * ícone para manter o texto legível.
 */
export function TaskProgress({ concluidas, total, vencidas = 0 }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Check className="h-4 w-4 text-emerald-600" />
        <span className="text-[12px] font-semibold leading-4 text-[#0a0a0a]">
          {concluidas}/{total}
        </span>
        <span className="text-[12px] font-normal leading-4 text-[#0a0a0a]">
          Tarefas concluídas
        </span>
      </div>
      {vencidas > 0 ? (
        <>
          <span aria-hidden className="h-3.5 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-rose-600" />
            <span className="text-[12px] font-semibold leading-4 text-[#0a0a0a]">
              {vencidas}
            </span>
            <span className="text-[12px] font-normal leading-4 text-[#0a0a0a]">
              {vencidas > 1 ? 'tarefas vencidas' : 'tarefa vencida'}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
