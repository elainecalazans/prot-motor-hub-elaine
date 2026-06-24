import { useState } from 'react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Ban, MoreVertical, Loader2, FileText, TriangleAlert, Check } from 'lucide-react';
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
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  cn,
} from '@bhubai/bhub-design-system';
import type {
  StatusFechamento,
  StatusFolha,
  TarefaEntrada,
  TarefaFechamento,
  TarefaSaida,
} from '@/types/gpc';
import { deriveStatusEntrada } from '@/lib/status';
import { STATUS_TOOLTIP } from '@/lib/status-tooltips';
import { HOJE_SIMULADO } from '@/mocks/seed';
import { StatusIcon } from './StatusIcon';
import { AutomacaoBadge } from './AutomacaoBadge';
import { derivarUrgenciaExtrato } from '@/lib/extrato-prazo';
import { AutomacaoOpenFinanceModal } from './AutomacaoOpenFinanceModal';
import { FolhaStatusBadge } from './FolhaStatusBadge';
import { TaskIconTooltip } from './TaskIconTooltip';
import { ConfirmarPagamentoGuiaDialog } from './detalhe/ConfirmarPagamentoGuiaDialog';
import { useGuiasPagas } from '@/hooks/useGuiasPagas';
import { useContasAutomatizadas } from '@/hooks/useContasAutomatizadas';

// Chip das guias: cinza quando disponível ou em apuração; verde quando o cliente
// marcou como paga (mesmos tokens da tarefa de entrada concluída).
function GuiaIcon({ calculando, paga }: { calculando: boolean; paga: boolean }) {
  if (paga) {
    return (
      <TaskIconTooltip content={STATUS_TOOLTIP.guiaPaga}>
        <span
          role="img"
          aria-label="Guia paga"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
        >
          <Check className="h-4 w-4" />
        </span>
      </TaskIconTooltip>
    );
  }

  const tooltip = calculando
    ? STATUS_TOOLTIP.entregavelProcessando
    : STATUS_TOOLTIP.entregavelDisponivel;

  return (
    <TaskIconTooltip content={tooltip}>
      <span
        role="img"
        aria-label="Guia"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5] text-neutral-600"
      >
        <FileText className="h-4 w-4" />
      </span>
    </TaskIconTooltip>
  );
}

// Chip da folha de pagamento: mesmo ícone de documento das guias, mas com a cor
// refletindo o status — neutro em processamento, âmbar quando aguarda a
// aprovação do cliente e verde quando aprovada.
const FOLHA_CHIP_COR: Record<StatusFolha, string> = {
  'em-processamento': 'bg-[#f5f5f5] text-neutral-600',
  'aguardando-aprovacao': 'bg-warning-subtle text-warning-text',
  aprovado: 'bg-success-subtle text-success-text',
};

const folhaTooltipByStatus: Record<StatusFolha, string> = {
  'em-processamento': STATUS_TOOLTIP.entregavelProcessando,
  'aguardando-aprovacao': STATUS_TOOLTIP.pendencia,
  aprovado: STATUS_TOOLTIP.folhaProcessada,
};

function FolhaIcon({ status }: { status: StatusFolha }) {
  const tooltip = folhaTooltipByStatus[status];

  return (
    <TaskIconTooltip content={tooltip}>
      <span
        role="img"
        aria-label="Folha de pagamento"
        className={cn(
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          FOLHA_CHIP_COR[status]
        )}
      >
        <FileText className="h-4 w-4" />
      </span>
    </TaskIconTooltip>
  );
}

// Chip do Fechamento contábil: mesmo ícone de documento dos demais entregáveis
// (guias/folha), só a cor reflete o status — neutro em andamento, âmbar quando
// aguarda sua ação e verde quando concluído. O significado nunca fica só na cor:
// vai sempre acompanhado de rótulo (aria-label + texto no card + badge).
const FECHAMENTO_CHIP_COR: Record<StatusFechamento, { chip: string; aria: string }> = {
  concluido: { chip: 'bg-success-subtle text-success-text', aria: 'Fechamento concluído' },
  'acao-necessaria': {
    chip: 'bg-warning-subtle text-warning-text',
    aria: 'Fechamento aguardando sua ação',
  },
  'em-andamento': { chip: 'bg-[#f5f5f5] text-neutral-600', aria: 'Fechamento em andamento' },
};

const fechamentoTooltipByStatus: Record<StatusFechamento, string> = {
  'em-andamento': STATUS_TOOLTIP.entregavelProcessando,
  'acao-necessaria': STATUS_TOOLTIP.pendencia,
  concluido: STATUS_TOOLTIP.fechamentoConcluido,
};

function FechamentoIcon({ status }: { status: StatusFechamento }) {
  const { chip, aria } = FECHAMENTO_CHIP_COR[status];
  const tooltip = fechamentoTooltipByStatus[status];

  return (
    <TaskIconTooltip content={tooltip}>
      <span
        role="img"
        aria-label={aria}
        className={cn('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', chip)}
      >
        <FileText className="h-4 w-4" />
      </span>
    </TaskIconTooltip>
  );
}

/**
 * Linha de título do card: data (em destaque sutil) + título da tarefa. A data
 * fica levemente apagada para o título ser a informação dominante.
 */
function TituloComData({ data, titulo }: { data: string; titulo: string }) {
  return (
    <>
      <span className="font-medium tabular-nums text-[#737373]">{data}</span>
      <span className="px-1.5 text-[#d4d4d4]" aria-hidden>
        ·
      </span>
      {titulo}
    </>
  );
}

interface BaseProps {
  leading: React.ReactNode;
  /** Linha principal: data + título da tarefa/entregável (ver TituloComData). */
  titulo: React.ReactNode;
  /** Frase curta resumindo o que o usuário precisa fazer/saber. Aceita ReactNode para badges inline. */
  resumo: React.ReactNode;
  highlighted?: boolean;
  /** Atenua o card (ex.: tarefa cancelada) — fica mais transparente e inerte. */
  atenuado?: boolean;
  onClick?: () => void;
  rightSlot: React.ReactNode;
}

function CardShell({
  leading,
  titulo,
  resumo,
  highlighted,
  atenuado,
  onClick,
  rightSlot,
}: BaseProps) {
  const clickable = !!onClick;
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        'flex items-center gap-8 rounded-lg border bg-white px-6 py-4 transition-colors',
        clickable &&
          'cursor-pointer hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mizu-flow-bold/40',
        highlighted ? 'border-mizu-flow-bold' : 'border-border',
        atenuado && 'opacity-60'
      )}
    >
      {leading}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-semibold leading-5 text-[#0a0a0a]">{titulo}</p>
        <div className="flex flex-col text-[13px] leading-5 text-[#737373]">{resumo}</div>
      </div>
      <div
        className="flex shrink-0 items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {rightSlot}
      </div>
    </div>
  );
}

export function TarefaEntradaCard({
  tarefa,
  highlighted,
  onOpen,
}: {
  tarefa: TarefaEntrada;
  highlighted?: boolean;
  onOpen?: (tarefa: TarefaEntrada) => void;
}) {
  const status = deriveStatusEntrada(tarefa, HOJE_SIMULADO);
  const expirada = status === 'atrasada';
  const [confirmarSemEnvio, setConfirmarSemEnvio] = useState(false);
  const [abrirAutomacao, setAbrirAutomacao] = useState(false);
  // Automação é por conta (Open Finance), não por tarefa: o badge é derivado do
  // store. Tarefa elegível mostra "Automatizar" enquanto nenhuma conta estiver
  // automatizada e passa a "Automático" assim que houver ≥1.
  const { quantidade: contasAutomatizadas } = useContasAutomatizadas();
  const estadoBadge =
    tarefa.automacao === 'elegivel' && contasAutomatizadas > 0 ? 'ativa' : tarefa.automacao;

  // Badge de urgência de prazo — só para tarefas de extrato sem arquivos enviados.
  const urgencia =
    tarefa.tipo === 'extratos'
      ? derivarUrgenciaExtrato(tarefa.prazo, HOJE_SIMULADO, tarefa.arquivos)
      : 'ok';

  // Tarefa cancelada: card atenuado, inerte (sem ações) e com badge cinza.
  if (tarefa.cancelada) {
    return (
      <CardShell
        atenuado
        highlighted={highlighted}
        leading={
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5] text-neutral-500">
            <Ban className="h-4 w-4" />
          </span>
        }
        titulo={
          <TituloComData data={format(parseISO(tarefa.prazo), 'dd/MM')} titulo={tarefa.titulo} />
        }
        resumo={tarefa.descricao ?? 'Tarefa cancelada'}
        rightSlot={<Badge variant="secondary">Cancelada</Badge>}
      />
    );
  }

  return (
    <CardShell
      leading={<StatusIcon status={status} />}
      titulo={<TituloComData data={format(parseISO(tarefa.prazo), 'dd/MM')} titulo={tarefa.titulo} />}
      resumo={
        <>
          {tarefa.descricao ?? tarefa.titulo}
          {urgencia === 'urgente' && (
            <Badge variant="destructive" className="mt-1.5 gap-1 self-start">
              <TriangleAlert className="h-3 w-3" />
              Envio urgente
            </Badge>
          )}
          {urgencia === 'lembrete' && (
            <Badge variant="warning" className="mt-1.5 gap-1 self-start">
              <TriangleAlert className="h-3 w-3" />
              Lembrete de envio
            </Badge>
          )}
        </>
      }
      highlighted={highlighted}
      onClick={onOpen ? () => onOpen(tarefa) : undefined}
      rightSlot={
        <>
          <AutomacaoBadge
            estado={estadoBadge}
            qtdAutomatizadas={contasAutomatizadas}
            onClick={() => setAbrirAutomacao(true)}
          />
          <Button size="sm" onClick={() => onOpen?.(tarefa)}>
            Ver tarefa
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <IconButton size="sm" variant="ghost" aria-label="Mais ações">
                <MoreVertical className="h-4 w-4" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {expirada ? (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setConfirmarSemEnvio(true);
                  }}
                >
                  Concluir sem envio
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem>Ajuda com essa tarefa</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={confirmarSemEnvio} onOpenChange={setConfirmarSemEnvio}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-warning-subtle text-warning-text">
                  <TriangleAlert className="h-8 w-8" />
                </AlertDialogMedia>
                <AlertDialogTitle>Concluir tarefa sem envio?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você confirma que <strong>não houve documentos para enviar</strong> nesta
                  tarefa neste mês. A tarefa será marcada como concluída e a contabilidade
                  seguirá o fechamento sem este material. Se houver documentos depois, você
                  ainda poderá enviá-los fora do prazo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="warning"
                  onClick={() => toast.success('Tarefa concluída sem envio')}
                >
                  Confirmar conclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AutomacaoOpenFinanceModal open={abrirAutomacao} onOpenChange={setAbrirAutomacao} />
        </>
      }
    />
  );
}

export function GuiaCard({
  tarefa,
  highlighted,
  onOpen,
}: {
  tarefa: TarefaSaida;
  highlighted?: boolean;
  onOpen?: (tarefa: TarefaSaida) => void;
}) {
  const { isPaga, marcarComoPaga } = useGuiasPagas();
  const calculando = tarefa.status === 'calculando';
  const paga = !!tarefa.marcadaComoPaga || isPaga(tarefa.id);
  const disponivel = !calculando;
  const podeMarcarPaga = disponivel && !paga;
  const [confirmarPagamento, setConfirmarPagamento] = useState(false);

  const dataStr = tarefa.prazo ? format(parseISO(tarefa.prazo), 'dd/MM') : '—';
  const resumo = calculando
    ? 'A BHub está calculando o valor desta guia'
    : paga
      ? 'Guia marcada como paga'
      : 'Guia disponível para download e pagamento';

  return (
    <CardShell
      leading={<GuiaIcon calculando={calculando} paga={paga} />}
      titulo={<TituloComData data={dataStr} titulo={tarefa.titulo} />}
      resumo={resumo}
      highlighted={highlighted}
      onClick={calculando || !onOpen ? undefined : () => onOpen(tarefa)}
      rightSlot={
        <>
          <Button
            size="sm"
            disabled={calculando}
            className={calculando ? 'opacity-50' : undefined}
            onClick={calculando ? undefined : () => onOpen?.(tarefa)}
          >
            Ver guia
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <IconButton size="sm" variant="ghost" aria-label="Mais ações">
                <MoreVertical className="h-4 w-4" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {calculando ? null : <DropdownMenuItem>Baixar guia</DropdownMenuItem>}
              {podeMarcarPaga ? (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setConfirmarPagamento(true);
                  }}
                >
                  Marcar como paga
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem>Ajuda com esse documento</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmarPagamentoGuiaDialog
            open={confirmarPagamento}
            onOpenChange={setConfirmarPagamento}
            onConfirm={() => {
              if (marcarComoPaga(tarefa.id)) {
                toast.success('Guia marcada como paga');
              }
            }}
          />
        </>
      }
    />
  );
}

export function FolhaCard({
  tarefa,
  highlighted,
  onOpen,
}: {
  tarefa: TarefaSaida;
  highlighted?: boolean;
  onOpen?: (tarefa: TarefaSaida) => void;
}) {
  const status = tarefa.statusFolha ?? 'em-processamento';
  const dataStr = tarefa.prazo ? format(parseISO(tarefa.prazo), 'dd/MM') : '—';
  const resumo =
    status === 'em-processamento'
      ? 'A BHub está preparando a folha deste mês'
      : status === 'aguardando-aprovacao'
        ? 'Revise e aprove a folha enviada pela BHub'
        : 'Folha aprovada e disponível para download';

  return (
    <CardShell
      leading={<FolhaIcon status={status} />}
      titulo={<TituloComData data={dataStr} titulo={tarefa.titulo} />}
      resumo={resumo}
      highlighted={highlighted}
      onClick={onOpen ? () => onOpen(tarefa) : undefined}
      rightSlot={
        <>
          {/* Aprovada não precisa de badge — o ícone verde já comunica o estado. */}
          {status === 'aprovado' ? null : <FolhaStatusBadge status={status} />}
          <Button size="sm" onClick={() => onOpen?.(tarefa)}>
            Ver folha
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <IconButton size="sm" variant="ghost" aria-label="Mais ações">
                <MoreVertical className="h-4 w-4" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ajuda com a folha de pagamento</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  );
}

export function FechamentoCard({
  tarefa,
  highlighted,
  onOpen,
}: {
  tarefa: TarefaFechamento;
  highlighted?: boolean;
  onOpen?: (tarefa: TarefaFechamento) => void;
}) {
  const pendencias = tarefa.movimentacoes.length;

  const dataStr =
    tarefa.status === 'concluido' && tarefa.fechadoEm
      ? format(parseISO(tarefa.fechadoEm), 'dd/MM')
      : tarefa.prazo
        ? format(parseISO(tarefa.prazo), 'dd/MM')
        : '—';

  const resumo =
    tarefa.status === 'concluido'
      ? 'Fechamento concluído'
      : pendencias > 0
        ? `${pendencias} ${pendencias > 1 ? 'movimentações aguardam' : 'movimentação aguarda'} você`
        : 'Acompanhe o andamento do mês';

  // Concluído dispensa badge: o ícone verde já comunica o estado. Os demais
  // estados ganham um badge à direita (pendências em aberto / em andamento).
  const badge =
    pendencias > 0 ? (
      <Badge
        variant="warning"
        className="gap-1 border-transparent bg-warning-subtle text-warning-text"
      >
        <TriangleAlert className="h-3 w-3" />
        {pendencias} {pendencias > 1 ? 'pendências' : 'pendência'}
      </Badge>
    ) : tarefa.status === 'em-andamento' ? (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Em andamento
      </Badge>
    ) : null;

  return (
    <CardShell
      leading={<FechamentoIcon status={tarefa.status} />}
      titulo={<TituloComData data={dataStr} titulo={tarefa.titulo} />}
      resumo={resumo}
      highlighted={highlighted}
      onClick={onOpen ? () => onOpen(tarefa) : undefined}
      rightSlot={
        <>
          {badge}
          <Button size="sm" onClick={() => onOpen?.(tarefa)}>
            Ver fechamento
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <IconButton size="sm" variant="ghost" aria-label="Mais ações">
                <MoreVertical className="h-4 w-4" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ajuda com esse entregável</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  );
}
