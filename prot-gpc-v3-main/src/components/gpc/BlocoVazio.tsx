import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
}

/**
 * Empty state dos blocos da Home (Tarefas / Entregáveis) quando a competência
 * navegada não tem itens — ex.: meses futuros ainda sem obrigações.
 */
export function BlocoVazio({ icon: Icon, titulo, descricao }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-white px-6 py-10 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm font-semibold text-foreground">{titulo}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{descricao}</p>
    </div>
  );
}
