import { Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@bhubai/bhub-design-system';

export function ConfirmarPagamentoGuiaDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-success-subtle text-success-text">
            <Check className="h-8 w-8" />
          </AlertDialogMedia>
          <AlertDialogTitle>Marcar guia como paga?</AlertDialogTitle>
          <AlertDialogDescription>
            Você confirma que <strong>já realizou o pagamento</strong> desta guia? Essa marcação
            é apenas para o seu controle — não substitui o comprovante e não é obrigatória para a
            contabilidade.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmar pagamento</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
