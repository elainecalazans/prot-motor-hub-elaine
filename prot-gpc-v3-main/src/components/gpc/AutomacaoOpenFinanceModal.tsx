import { useState } from 'react';
import { Landmark, Plus, ShieldCheck, Unplug, Zap } from 'lucide-react';
import { toast } from 'sonner';
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
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  cn,
} from '@bhubai/bhub-design-system';
import type { ContaFinanceira } from '@/types/gpc';
import { contasFinanceiras } from '@/mocks/seed';
import { useContasAutomatizadas } from '@/hooks/useContasAutomatizadas';
import { ContaAutomaticaBadge } from './ContaAutomaticaBadge';

/** Rótulo amigável da conta (mesmo formato usado em ExtratosBody). */
const rotuloConta = (c: ContaFinanceira) => `${c.banco} · ${c.tipo} ${c.identificacao}`;

// Passos do "como funciona" (educativo). O 4º traz o parceiro Pluggy em
// destaque; o 5º incorpora o resultado ("e pronto!") — antes um alerta roxo
// separado, agora unificado no último passo para encurtar o modal.
const PASSOS: React.ReactNode[] = [
  'Selecione um banco disponível',
  'Preencha os dados de acesso (login) do banco',
  'Você será redirecionado ao seu banco, com a segurança do Open Finance, para concluir a autorização',
  <>
    Siga os passos na tela do banco e autorize o compartilhamento com nosso parceiro{' '}
    <strong className="font-semibold text-foreground">
      Pluggy Brasil Instituição de Pagamentos Ltda.
    </strong>{' '}
    (CNPJ 37.943.755/0001-30)
  </>,
  <>
    Confirme os dados que serão compartilhados e{' '}
    <strong className="font-semibold text-foreground">pronto!</strong> A conta passa a enviar os
    extratos automaticamente. Se ela ainda não estiver cadastrada no Hub, nós a cadastramos para
    você.
  </>,
];

/** Stepper vertical numerado (o DS não tem Stepper — componente local). */
function PassosOpenFinance() {
  return (
    <ol className="flex flex-col">
      {PASSOS.map((passo, i) => {
        const ultimo = i === PASSOS.length - 1;
        return (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              {!ultimo ? <span className="my-1 w-px flex-1 bg-border" /> : null}
            </div>
            <p className={cn('text-sm leading-5 text-muted-foreground', ultimo ? 'pb-0' : 'pb-3')}>
              {passo}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/** Linha de uma conta conectada na lista do modal. */
function ContaConectadaItem({
  conta,
  onRemover,
}: {
  conta: ContaFinanceira;
  onRemover: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
      {/* Ícone tingido de roxo: a conta ESTÁ automatizada (cor = significado). */}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-automacao-subtle text-automacao">
        <Landmark className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{conta.banco}</span>
        <span className="truncate text-xs text-muted-foreground">
          {conta.tipo} · {conta.identificacao}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ContaAutomaticaBadge />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label={`Remover automação de ${rotuloConta(conta)}`}
          onClick={onRemover}
        >
          Remover
        </Button>
      </div>
    </li>
  );
}

export function AutomacaoOpenFinanceModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isAutomatizada, automatizar, remover } = useContasAutomatizadas();
  // Conta aguardando confirmação de remoção (abre o AlertDialog quando != null).
  const [contaParaRemover, setContaParaRemover] = useState<ContaFinanceira | null>(null);

  // Mostramos só as contas conectadas (automatizadas), não o cadastro inteiro.
  const conectadas = contasFinanceiras.filter((c) => isAutomatizada(c.id));
  const temConectadas = conectadas.length > 0;

  // Simula a conexão via Open Finance: conecta a próxima conta ainda não
  // conectada. Quando todas já estão conectadas, apenas confirma.
  const conectarConta = () => {
    const proxima = contasFinanceiras.find((c) => !isAutomatizada(c.id));
    if (!proxima) {
      toast.info('Tudo conectado', {
        description:
          'Todas as suas contas já estão conectadas e enviando os extratos automaticamente.',
      });
      return;
    }
    automatizar(proxima.id);
    toast.success('Conta conectada', {
      description: `${rotuloConta(proxima)} agora envia os extratos automaticamente.`,
    });
  };

  // Confirmada no AlertDialog: desfaz a conexão Open Finance da conta.
  const confirmarRemocao = () => {
    if (!contaParaRemover) return;
    remover(contaParaRemover.id);
    toast.success('Automação removida', {
      description: `${rotuloConta(contaParaRemover)} volta a exigir o envio manual do extrato.`,
    });
    setContaParaRemover(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" showCloseButton>
          {/* Header band — zona de automação dedicada. O roxo aqui não decora:
              declara o assunto do modal e ancora a hierarquia num ponto focal. */}
          <DialogHeader className="flex flex-row items-start gap-3.5 bg-automacao-subtle px-6 pb-5 pt-6 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-automacao text-white">
              <Zap className="h-5 w-5" />
            </span>
            <div className="flex flex-col gap-1 pr-6">
              <DialogTitle className="text-xl leading-tight">
                Automatize o envio dos seus extratos
              </DialogTitle>
              <DialogDescription className="text-sm">
                Conecte suas contas pelo Open Finance e os extratos chegam à contabilidade sozinhos,
                todo mês.
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Cap dinâmico (viewport − header): o corpo cresce até caber e só
              rola quando o modal realmente não couber na tela. Em telas normais,
              sem scroll. */}
          <div className="flex max-h-[calc(100vh-9rem)] flex-col overflow-y-auto px-6 pb-6 pt-5">
            {/* Ação primária primeiro: conectar (empty) ou gerenciar (lista). O
                "Como funciona" é referência e vem depois, para não empurrar o CTA
                para baixo da dobra. */}
            <section className="flex flex-col gap-3">
              {temConectadas ? (
                <>
                  <h3 className="text-sm font-semibold text-foreground">
                    Contas conectadas{' '}
                    <span className="font-normal text-muted-foreground">({conectadas.length})</span>
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {conectadas.map((c) => (
                      <ContaConectadaItem
                        key={c.id}
                        conta={c}
                        onRemover={() => setContaParaRemover(c)}
                      />
                    ))}
                  </ul>
                  <div className="flex justify-center pt-1">
                    <Button type="button" variant="outline" onClick={conectarConta}>
                      <Plus className="h-4 w-4" />
                      Conectar outra conta
                    </Button>
                  </div>
                </>
              ) : (
                // Empty state = o momento de ativação. Vende o valor com confiança,
                // não só "nada aqui": medalhão forte, benefício claro, CTA e a
                // garantia de segurança (a marca é, antes de tudo, tranquilizadora).
                <div className="flex flex-col items-center gap-4 pb-1 pt-2 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-automacao-subtle text-automacao">
                    <Landmark className="h-7 w-7" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-semibold text-foreground">
                      Conecte sua primeira conta
                    </h3>
                    <p className="max-w-xs text-sm text-muted-foreground">
                      Conecte uma vez e os extratos chegam sozinhos, todo mês.
                    </p>
                  </div>
                  <Button type="button" onClick={conectarConta}>
                    <Plus className="h-4 w-4" />
                    Conectar conta
                  </Button>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    Conexão segura, regulada pelo Open Finance
                  </p>
                </div>
              )}
            </section>

            {/* Como funciona — referência secundária, abaixo da ação. O resultado
                ("e pronto!") agora vive no último passo, sem alerta separado. */}
            <section className="mt-5 flex flex-col gap-3 border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-foreground">Como funciona</h3>
              <PassosOpenFinance />
            </section>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={contaParaRemover !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setContaParaRemover(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-warning-subtle text-warning-text">
              <Unplug className="h-8 w-8" />
            </AlertDialogMedia>
            <AlertDialogTitle>Remover a automação desta conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Você vai desconectar a conta{' '}
              <strong className="font-semibold text-foreground">
                {contaParaRemover ? rotuloConta(contaParaRemover) : ''}
              </strong>{' '}
              do Open Finance. Os extratos dela deixam de chegar automaticamente — se houver
              movimentação no mês, você precisará{' '}
              <strong className="font-semibold text-foreground">enviar o extrato manualmente</strong>.
              Você pode reconectar quando quiser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="warning" onClick={confirmarRemocao}>
              Remover automação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
