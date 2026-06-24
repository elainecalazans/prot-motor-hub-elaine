import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Loader2,
  TriangleAlert,
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from '@bhubai/bhub-design-system';
import type {
  EtapaFechamento,
  MovimentacaoNaoIdentificada,
  NotaFiscalRef,
  OrigemFechamento,
  StatusEtapa,
  StatusFechamento,
  TarefaFechamento,
} from '@/types/gpc';
import { formatCompetencia } from '@/lib/competencia';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ---- Badge de status geral (usado no header do detalhe via statusSlot) ----

const FECHAMENTO_BADGE: Record<
  StatusFechamento,
  { variant: 'success' | 'warning' | 'secondary'; Icon: typeof Check; label: string; spin?: boolean }
> = {
  concluido: { variant: 'success', Icon: Check, label: 'Concluído' },
  'acao-necessaria': { variant: 'warning', Icon: CircleAlert, label: 'Ação necessária' },
  'em-andamento': { variant: 'secondary', Icon: Loader2, label: 'Em andamento', spin: true },
};

export function FechamentoStatusBadge({ status }: { status: StatusFechamento }) {
  const { variant, Icon, label, spin } = FECHAMENTO_BADGE[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className={spin ? 'h-3 w-3 animate-spin' : 'h-3 w-3'} />
      {label}
    </Badge>
  );
}

// ---- Etapas do fechamento (Hub 5) ----
// Status comunicado por cor + ícone + rótulo (nunca só cor): o chip carrega a
// cor e um sr-only, e o texto da etapa carrega o significado em linguagem clara.

const ETAPA_STATUS: Record<
  StatusEtapa,
  { chip: string; Icon: typeof CheckCircle2; sr: string; spin?: boolean }
> = {
  ok: { chip: 'bg-success/10 text-success', Icon: CheckCircle2, sr: 'Tudo certo' },
  atencao: { chip: 'bg-warning-subtle text-warning-text', Icon: TriangleAlert, sr: 'Atenção' },
  pendente: { chip: 'bg-warning-subtle text-warning-text', Icon: CircleAlert, sr: 'Ação necessária' },
  processando: {
    chip: 'bg-muted text-muted-foreground',
    Icon: Loader2,
    sr: 'Em processamento',
    spin: true,
  },
};

function EtapaRow({ etapa }: { etapa: EtapaFechamento }) {
  const { chip, Icon, sr, spin } = ETAPA_STATUS[etapa.status];
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className={cn(
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          chip
        )}
      >
        <Icon className={cn('h-4 w-4', spin && 'animate-spin')} />
        <span className="sr-only">{sr}</span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium text-foreground">{etapa.rotulo}</span>
        <span className="text-sm text-muted-foreground">{etapa.detalhe}</span>
      </div>
    </div>
  );
}

// ---- Movimentações não identificadas (Hub 4) ----

const NF_SENTINEL = '__nf__';

const CATEGORIAS_RECEBIMENTO = [
  'Venda de produto',
  'Prestação de serviço',
  'Empréstimo recebido',
  'Aporte de sócio',
  'Transferência entre contas próprias',
  'Outro',
];

const CATEGORIAS_PAGAMENTO = [
  'Pagamento de fornecedor',
  'Despesa operacional',
  'Pagamento de empréstimo',
  'Transferência entre contas próprias',
  'Outro',
];

function MovimentacaoItem({
  mov,
  notas,
  resumo,
  onResolver,
}: {
  mov: MovimentacaoNaoIdentificada;
  notas: NotaFiscalRef[];
  resumo?: string;
  onResolver: (id: string, resumo: string) => void;
}) {
  const [categoria, setCategoria] = useState('');
  const [notaId, setNotaId] = useState('');
  const [texto, setTexto] = useState('');

  const recebimento = mov.tipo === 'recebimento';
  const categorias = recebimento ? CATEGORIAS_RECEBIMENTO : CATEGORIAS_PAGAMENTO;
  const pergunta = recebimento
    ? 'De onde veio este valor?'
    : 'Este pagamento foi referente a quê?';

  const vinculandoNota = categoria === NF_SENTINEL;
  const podeConfirmar =
    (!!categoria && (!vinculandoNota || !!notaId)) || texto.trim().length > 0;

  const confirmar = () => {
    let r: string;
    if (vinculandoNota) {
      const nota = notas.find((n) => n.id === notaId);
      r = `Vinculado à ${nota?.rotulo ?? 'nota fiscal'}`;
    } else if (categoria) {
      r = `Classificado como ${categoria}`;
      if (texto.trim()) r += ` — ${texto.trim()}`;
    } else {
      r = texto.trim();
    }
    onResolver(mov.id, r);
  };

  const cabecalho = (
    <div className="flex items-start gap-3">
      <span
        role="img"
        aria-label={recebimento ? 'Entrada de dinheiro' : 'Saída de dinheiro'}
        className={cn(
          'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          recebimento ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
        )}
      >
        {recebimento ? (
          <ArrowDownLeft className="h-4 w-4" />
        ) : (
          <ArrowUpRight className="h-4 w-4" />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-semibold text-foreground">{formatBRL(mov.valor)}</span>
          <span className="text-xs text-muted-foreground">
            {recebimento ? 'recebido' : 'pago'} em {format(parseISO(mov.data), 'dd/MM/yyyy')}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{mov.descricaoExtrato}</span>
      </div>
    </div>
  );

  if (resumo) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4">
        {cabecalho}
        <div className="flex items-start gap-2 pl-11 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span className="text-muted-foreground">{resumo}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-4">
      {cabecalho}

      <div className="flex flex-col gap-3 pl-11">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-foreground">{pergunta}</Label>
          <Select
            value={categoria}
            onValueChange={(v) => {
              setCategoria(v);
              setNotaId('');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma opção" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
              {notas.length > 0 ? (
                <SelectItem value={NF_SENTINEL}>Vincular a uma nota fiscal…</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        </div>

        {vinculandoNota ? (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Qual nota fiscal?</Label>
            <Select value={notaId} onValueChange={setNotaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a nota" />
              </SelectTrigger>
              <SelectContent>
                {notas.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`obs-${mov.id}`} className="text-sm font-medium text-foreground">
            Quer detalhar? (opcional)
          </Label>
          <Textarea
            id={`obs-${mov.id}`}
            rows={2}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={
              recebimento
                ? 'Ex.: pagamento de um cliente pela venda da nota 4521.'
                : 'Ex.: compra de combustível para o carro da empresa.'
            }
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {mov.prazo ? (
            <span className="text-xs text-muted-foreground">
              Responda até {format(parseISO(mov.prazo), 'dd/MM')}
            </span>
          ) : (
            <span />
          )}
          <Button size="sm" disabled={!podeConfirmar} onClick={confirmar}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Histórico de competências ----

const ORIGEM: Record<
  OrigemFechamento,
  { variant: 'success' | 'warning'; label: string; tooltip: string }
> = {
  normal: {
    variant: 'success',
    label: 'Concluído',
    tooltip: 'Fechamento normal: extrato recebido, tudo conciliado e lançado no período.',
  },
  'via-caixa': {
    variant: 'warning',
    label: 'Via caixa',
    tooltip:
      'Fechado com base nos comprovantes de pagamento de tributos porque não recebemos o extrato bancário do mês. As movimentações comerciais não entraram nesta competência.',
  },
  'com-pendencias': {
    variant: 'warning',
    label: 'Com pendências',
    tooltip:
      'Fechado, mas com movimentações que não foram esclarecidas a tempo e ficaram em aberto na competência.',
  },
};

/**
 * Painel de Fechamento contábil. Reúne, em uma só tela, o andamento do mês
 * (etapas em linguagem de negócio), as movimentações que dependem do cliente
 * (resolvíveis ali mesmo) e o histórico de competências anteriores.
 */
export function FechamentoContabilBody({ tarefa }: { tarefa: TarefaFechamento }) {
  const navigate = useNavigate();
  const [resolvidos, setResolvidos] = useState<Record<string, string>>({});

  const pendentes = tarefa.movimentacoes.filter((m) => !resolvidos[m.id]);
  const todasResolvidas =
    tarefa.movimentacoes.length > 0 && pendentes.length === 0;
  const emAndamento = tarefa.status === 'em-andamento';

  const resolver = (id: string, resumo: string) => {
    setResolvidos((cur) => ({ ...cur, [id]: resumo }));
    toast.success('Resposta enviada', {
      description: 'Sua explicação foi para a contabilidade.',
    });
  };

  return (
    <>
      {tarefa.origem === 'via-caixa' ? (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Fechamento realizado via caixa</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Não recebemos seu extrato bancário deste mês, então fechamos com base nos
            comprovantes de pagamento de tributos. As movimentações comerciais (fornecedores,
            outras despesas) não foram lançadas nesta competência. Para um fechamento completo,
            conecte sua conta via Open Finance ou envie o extrato no próximo mês.
          </AlertDescription>
        </Alert>
      ) : tarefa.origem === 'com-pendencias' ? (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Fechamento concluído com pendências</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Algumas movimentações não foram esclarecidas a tempo e ficaram em aberto nesta
            competência. Elas seguem registradas para regularização — se precisar, fale com a
            contabilidade.
          </AlertDescription>
        </Alert>
      ) : null}

      {tarefa.status === 'acao-necessaria' && !todasResolvidas ? (
        <Alert variant="warning">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Sua ação é necessária para concluir o fechamento</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Resolva as movimentações em “Precisamos da sua ajuda”, logo abaixo. Assim que
            terminar, a contabilidade finaliza o fechamento do mês.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Andamento do fechamento</CardTitle>
          <CardDescription>Veja em que pé está o fechamento deste mês.</CardDescription>
        </CardHeader>
        <CardContent>
          {emAndamento ? (
            <Empty
              title="Fechamento em andamento"
              description="O fechamento ainda está em processamento, conforme as datas do mês. Você vai poder acompanhar cada etapa por aqui — e, se algo depender de você, a gente avisa."
            />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {tarefa.etapas.map((e) => (
                <EtapaRow key={e.chave} etapa={e} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {tarefa.movimentacoes.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <CardTitle>Precisamos da sua ajuda</CardTitle>
                <CardDescription>
                  Algumas movimentações do seu extrato não foram reconhecidas. Conte pra
                  gente o que foram para concluirmos o fechamento.
                </CardDescription>
              </div>
              {!todasResolvidas ? (
                <Badge variant="warning" className="shrink-0 gap-1">
                  <TriangleAlert className="h-3 w-3" />
                  {pendentes.length}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {todasResolvidas ? (
              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">Tudo resolvido!</span>
                  <span className="text-muted-foreground">
                    Obrigado! Suas respostas foram para a contabilidade e o fechamento vai
                    seguir.
                  </span>
                </div>
              </div>
            ) : null}

            {tarefa.movimentacoes.map((m) => (
              <MovimentacaoItem
                key={m.id}
                mov={m}
                notas={tarefa.notasDisponiveis}
                resumo={resolvidos[m.id]}
                onResolver={resolver}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Fechamentos anteriores</CardTitle>
          <CardDescription>
            Veja como foram fechados os meses anteriores. Clique em um mês para abrir o
            fechamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competência</TableHead>
                  <TableHead>Fechado em</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tarefa.historico.map((h) => {
                  const o = ORIGEM[h.origem];
                  const label = cap(formatCompetencia(h.competencia));
                  return (
                    <TableRow
                      key={h.competencia}
                      role="button"
                      tabIndex={0}
                      aria-label={`Abrir fechamento de ${label}`}
                      onClick={() => navigate(`/tarefas/fech-${h.competencia}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/tarefas/fech-${h.competencia}`);
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <TableCell className="font-medium text-foreground">{label}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(parseISO(h.fechadoEm), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant={o.variant}>{o.label}</Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[260px]">
                              {o.tooltip}
                            </TooltipContent>
                          </Tooltip>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>
    </>
  );
}
