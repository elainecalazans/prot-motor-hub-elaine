import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Landmark, RefreshCw, TriangleAlert, Zap } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bhubai/bhub-design-system';
import type { ContaFinanceira } from '@/types/gpc';
import type { ArquivoItem } from '@/components/gpc/ArquivoList';
import { ArquivoList } from '@/components/gpc/ArquivoList';
import { FileDropzone } from '@/components/gpc/FileDropzone';
import { ContaAutomaticaBadge } from '@/components/gpc/ContaAutomaticaBadge';
import { AutomacaoOpenFinanceModal } from '@/components/gpc/AutomacaoOpenFinanceModal';
import { RenovarTokenModal } from '@/components/gpc/RenovarTokenModal';
import { useContasAutomatizadas } from '@/hooks/useContasAutomatizadas';
import { derivarUrgenciaExtrato } from '@/lib/extrato-prazo';
import { HOJE_SIMULADO } from '@/mocks/seed';
import { NovaContaDrawer } from './NovaContaDrawer';

let counter = 0;
const nextId = () => `ext-${Date.now()}-${counter++}`;

interface Props {
  contas: ContaFinanceira[];
  /** Extratos já enviados, por id de conta. */
  iniciais?: Record<string, ArquivoItem[]>;
  /**
   * Prazo da tarefa de extrato (ISO), usado para derivar urgência.
   * Quando ausente, os alertas de prazo não são exibidos.
   */
  prazo?: string;
  /**
   * Quantidade de arquivos já enviados nesta tarefa — se > 0, os alertas de
   * prazo são suprimidos (tarefa já em andamento).
   */
  arquivosEnviados?: number;
}

const rotuloConta = (c: ContaFinanceira) =>
  `${c.banco} · ${c.tipo} ${c.identificacao}`;

/**
 * Corpo do envio de extratos bancários. O cliente pode:
 *  - automatizar contas via Open Finance (recebem os extratos sozinhas),
 *  - enviar manualmente o extrato das contas que ainda não estão conectadas,
 *  - renovar a autorização de contas com token expirado, e
 *  - ver alertas de prazo quando o envio está se aproximando do vencimento.
 */
export function ExtratosBody({
  contas: contasIniciais,
  iniciais = {},
  prazo,
  arquivosEnviados = 0,
}: Props) {
  const [contas, setContas] = useState<ContaFinanceira[]>(contasIniciais);
  const [contaId, setContaId] = useState<string>('');
  const [porConta, setPorConta] = useState<Record<string, ArquivoItem[]>>(iniciais);
  const [abrirAutomacao, setAbrirAutomacao] = useState(false);

  // Estado do modal de renovação de token.
  const [renovarAberto, setRenovarAberto] = useState(false);
  const [contaRenovando, setContaRenovando] = useState<ContaFinanceira | null>(null);

  const { isAutomatizada, isExpirada, marcarExpirada, renovarToken, idsExpiradas } =
    useContasAutomatizadas();

  // Inicializa contas com tokenExpirado do seed no estado `expiradas` do hook.
  useEffect(() => {
    contasIniciais.forEach((c) => {
      if (c.tokenExpirado) marcarExpirada(c.id);
    });
    // Só executa na montagem — as contas iniciais não mudam.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Contas conectadas (envio automático) x expiradas x manuais.
  const conectadas = contas.filter((c) => isAutomatizada(c.id));
  const comTokenExpirado = contas.filter((c) => isExpirada(c.id));
  const manuais = contas.filter((c) => !isAutomatizada(c.id) && !isExpirada(c.id));
  const temConectadas = conectadas.length > 0;

  // A conta selecionada deixa de valer se passou a ser automática ou expirada.
  const contaSelecionada =
    contaId && !isAutomatizada(contaId) && !isExpirada(contaId) ? contaId : '';

  // Urgência de prazo (só relevante quando há prazo e nenhum arquivo enviado).
  const urgencia = prazo ? derivarUrgenciaExtrato(prazo, HOJE_SIMULADO, arquivosEnviados) : 'ok';

  const cadastrarConta = (conta: ContaFinanceira) => {
    setContas((current) => [...current, conta]);
    setContaId(conta.id);
  };

  const adicionar = (files: FileList) => {
    if (!contaSelecionada) {
      toast.error('Selecione uma conta antes de anexar o extrato.');
      return;
    }
    const novos: ArquivoItem[] = Array.from(files).map((file) => ({
      id: nextId(),
      nome: file.name,
      tamanho: file.size,
    }));
    setPorConta((current) => ({
      ...current,
      [contaSelecionada]: [...(current[contaSelecionada] ?? []), ...novos],
    }));
    toast.success(novos.length > 1 ? `${novos.length} extratos adicionados` : 'Extrato adicionado');
  };

  const remover = (cId: string, arquivoId: string) => {
    setPorConta((current) => ({
      ...current,
      [cId]: (current[cId] ?? []).filter((a) => a.id !== arquivoId),
    }));
  };

  const abrirRenovacao = (conta: ContaFinanceira) => {
    setContaRenovando(conta);
    setRenovarAberto(true);
  };

  const contasComExtratos = contas.filter((c) => (porConta[c.id]?.length ?? 0) > 0);

  return (
    <>
      {/* ── Alerta de prazo de envio ── */}
      {urgencia === 'urgente' && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Prazo se aproximando — envie o extrato agora</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Seu fechamento contábil está aguardando o extrato bancário. Você tem apenas{' '}
            <span className="font-semibold text-foreground">1 dia útil</span> para enviar
            — depois disso o fechamento pode ser prejudicado.
          </AlertDescription>
        </Alert>
      )}
      {urgencia === 'lembrete' && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Lembrete — envie o extrato em breve</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Faltam até <span className="font-semibold text-foreground">3 dias úteis</span> para
            o prazo de envio do extrato bancário. Envie o quanto antes para darmos continuidade
            ao seu fechamento contábil.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Alerta de token expirado ── */}
      {comTokenExpirado.length > 0 && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>
            {comTokenExpirado.length === 1
              ? `Sua conexão com ${comTokenExpirado[0].banco} expirou`
              : 'Conexões com Open Finance expiraram'}
          </AlertTitle>
          <AlertDescription className="flex flex-col gap-3 text-muted-foreground">
            <span>
              {comTokenExpirado.length === 1
                ? `Renove a autorização para continuar recebendo extratos da conta ${comTokenExpirado[0].banco} automaticamente.`
                : `Renove as autorizações para continuar recebendo extratos automaticamente das contas: ${comTokenExpirado.map((c) => c.banco).join(', ')}.`}
            </span>
            <div className="flex flex-wrap gap-2">
              {comTokenExpirado.map((c) => (
                <Button
                  key={c.id}
                  variant="outline"
                  size="sm"
                  onClick={() => abrirRenovacao(c)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Renovar {c.banco}
                </Button>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Envio automático</CardTitle>
          <CardDescription>
            Conecte suas contas pelo Open Finance e receba os extratos automaticamente, sem
            envio manual todo mês.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Contas automatizadas ativas */}
          {temConectadas && (
            <ul className="flex flex-col gap-2">
              {conectadas.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Landmark className="h-4 w-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{c.banco}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {c.tipo} · {c.identificacao} — extratos recebidos automaticamente
                    </span>
                  </div>
                  <ContaAutomaticaBadge />
                </li>
              ))}
            </ul>
          )}

          {/* Contas com token expirado — aparecem na seção de automático com badge âmbar */}
          {comTokenExpirado.length > 0 && (
            <ul className="flex flex-col gap-2">
              {comTokenExpirado.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-warning-subtle bg-warning-subtle/30 px-3 py-2"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning-subtle text-warning-text">
                    <Landmark className="h-4 w-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{c.banco}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {c.tipo} · {c.identificacao} — autorização expirada
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => abrirRenovacao(c)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Renovar
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {!temConectadas && comTokenExpirado.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma conta conectada ainda. Configure o Open Finance para receber os extratos
              automaticamente.
            </p>
          )}

          <div className="flex justify-center pt-1">
            <Button type="button" variant="outline" onClick={() => setAbrirAutomacao(true)}>
              <Zap className="h-4 w-4" />
              {temConectadas || comTokenExpirado.length > 0
                ? 'Gerenciar contas conectadas'
                : 'Configurar Open Finance'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enviar extrato manualmente</CardTitle>
          <CardDescription>
            {manuais.length > 0
              ? 'Para as contas sem envio automático, selecione a conta e anexe o extrato do mês. Repita para cada conta com movimentação.'
              : 'Todas as suas contas estão com envio automático — não há nada para enviar manualmente.'}
          </CardDescription>
        </CardHeader>
        {manuais.length > 0 ? (
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="conta">Conta financeira</Label>
                <NovaContaDrawer onCreate={cadastrarConta} />
              </div>
              <Select value={contaSelecionada} onValueChange={setContaId}>
                <SelectTrigger id="conta" className="w-full">
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {manuais.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {rotuloConta(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FileDropzone
              disabled={!contaSelecionada}
              label={
                contaSelecionada
                  ? 'Arraste o extrato ou clique para selecionar'
                  : 'Selecione uma conta para anexar o extrato'
              }
              hint="PDF, OFX ou planilha — até 10 MB por arquivo"
              onFiles={adicionar}
            />
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extratos enviados</CardTitle>
          <CardDescription>
            {contasComExtratos.length > 0
              ? 'Extratos enviados manualmente, organizados por conta.'
              : 'Você ainda não enviou nenhum extrato nesta tarefa.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {contasComExtratos.map((c) => (
            <div key={c.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                {rotuloConta(c)}
              </div>
              <ArquivoList
                arquivos={porConta[c.id] ?? []}
                onRemove={(arquivoId) => remover(c.id, arquivoId)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <AutomacaoOpenFinanceModal open={abrirAutomacao} onOpenChange={setAbrirAutomacao} />

      {contaRenovando && (
        <RenovarTokenModal
          open={renovarAberto}
          onOpenChange={setRenovarAberto}
          banco={contaRenovando.banco}
          onRenovado={() => {
            renovarToken(contaRenovando.id);
            setContaRenovando(null);
          }}
        />
      )}
    </>
  );
}
