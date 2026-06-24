import { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@bhubai/bhub-design-system';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banco: string;
  /** Chamado após renovação simulada com sucesso. */
  onRenovado: () => void;
}

/**
 * Modal focado exclusivamente em renovar a autorização de uma conta com token
 * expirado. Mais enxuto que o AutomacaoOpenFinanceModal (sem lista de contas,
 * sem passos de configuração) — só comunica o que acontecerá e executa.
 */
export function RenovarTokenModal({ open, onOpenChange, banco, onRenovado }: Props) {
  const [renovando, setRenovando] = useState(false);

  const renovar = async () => {
    setRenovando(true);
    // Simula latência de redirecionamento ao banco.
    await new Promise((res) => setTimeout(res, 1800));
    setRenovando(false);
    onOpenChange(false);
    onRenovado();
    toast.success('Autorização renovada', {
      description: `Sua conta ${banco} voltará a enviar extratos automaticamente.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Renovar autorização — {banco}</DialogTitle>
          <DialogDescription>
            Sua autorização com {banco} via Open Finance expirou. Renove para continuar
            recebendo extratos automaticamente — você será redirecionado ao seu banco para
            reconfirmar o compartilhamento.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
          <span>
            O processo é o mesmo da autorização original e leva menos de 1 minuto. Nenhum
            dado financeiro fica armazenado na BHub.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={renovando}>
            Cancelar
          </Button>
          <Button onClick={renovar} disabled={renovando}>
            {renovando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecionando…
              </>
            ) : (
              'Renovar autorização'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
