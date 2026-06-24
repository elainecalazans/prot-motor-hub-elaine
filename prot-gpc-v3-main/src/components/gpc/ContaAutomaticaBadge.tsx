import { Zap } from 'lucide-react';

/**
 * Badge "Automática" — marca uma conta cujo envio de extratos é automático
 * (conectada via Open Finance). Reaproveita o mesmo visual "magic" (roxo sólido)
 * do "Automático" do card da tarefa (AutomacaoBadge), para falar a mesma língua.
 */
export function ContaAutomaticaBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-automacao px-2 py-0.5 text-xs font-semibold text-white">
      <Zap className="h-3 w-3" />
      Automática
    </span>
  );
}
