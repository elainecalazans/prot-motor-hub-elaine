import { useState } from 'react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Info,
  RotateCcw,
  Send,
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Separator,
  Textarea,
} from '@bhubai/bhub-design-system';
import type { ArquivoFolha, EventoFolha, TarefaSaida } from '@/types/gpc';
import { ArquivoList } from '@/components/gpc/ArquivoList';
import { FileDropzone } from '@/components/gpc/FileDropzone';
import { useArquivos } from '@/lib/useArquivos';
import { HistoricoFolha } from './HistoricoFolha';

const USUARIO = { nome: 'Arthur Moreira', iniciais: 'AM' };

let counter = 0;
const nextId = () => `folha-evt-${Date.now()}-${counter++}`;

/** Linha de destaque para o arquivo atual da folha (sem ações — o CTA é o botão). */
function ArquivoDestaque({ arquivo }: { arquivo: ArquivoFolha }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <FileText className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{arquivo.nome}</span>
        {arquivo.legenda ? (
          <span className="text-xs text-muted-foreground">{arquivo.legenda}</span>
        ) : null}
      </div>
    </div>
  );
}

function HistoricoCard({ eventos }: { eventos: EventoFolha[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico da folha</CardTitle>
        <CardDescription>Acompanhe as versões e a troca com a contabilidade.</CardDescription>
      </CardHeader>
      <CardContent>
        <HistoricoFolha eventos={eventos} />
      </CardContent>
    </Card>
  );
}

/* ------------------------------- Em processamento ------------------------------- */

function EmProcessamentoBody({ folha }: { folha: TarefaSaida }) {
  const diaLimite = folha.prazo
    ? format(parseISO(folha.prazo), "dd 'de' MMMM", { locale: ptBR })
    : null;

  const apontar = () =>
    toast.info('Apontamento em folha', {
      description:
        'Este fluxo abre em Solicitações e estará disponível em breve neste protótipo.',
    });

  return (
    <>
      <Alert variant="info">
        <Clock className="h-4 w-4" />
        <AlertTitle>Sua folha está sendo processada</AlertTitle>
        <AlertDescription>
          Nossa equipe está montando a folha de pagamento deste mês.{' '}
          {diaLimite ? (
            <>
              Ela ficará disponível para a sua aprovação até{' '}
              <span className="font-semibold text-foreground">{diaLimite}</span>.
            </>
          ) : (
            'Avisaremos assim que ela estiver disponível para aprovação.'
          )}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Apontamento em folha</CardTitle>
          <CardDescription>
            Tem alguma variação para registrar neste mês — admissão, desligamento, férias,
            horas extras ou outros lançamentos? Faça o apontamento para a contabilidade
            considerar antes de fechar a folha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={apontar}>
            <ClipboardList className="h-4 w-4" />
            Fazer apontamento em folha
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

/* ------------------------------- Aprovada ------------------------------- */

function AprovadaBody({ folha }: { folha: TarefaSaida }) {
  const baixar = () =>
    toast.success('Folha baixada', { description: 'O download da folha de pagamento começou.' });

  return (
    <>
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Folha de pagamento aprovada</AlertTitle>
        <AlertDescription>
          Você aprovou esta folha e a contabilidade concluiu o processamento. O entregável
          final está disponível para download abaixo.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Entregável final</CardTitle>
          <CardDescription>Baixe a folha de pagamento aprovada deste mês.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {folha.arquivoFolha ? <ArquivoDestaque arquivo={folha.arquivoFolha} /> : null}
          <div>
            <Button onClick={baixar}>
              <Download className="h-4 w-4" />
              Baixar folha de pagamento
            </Button>
          </div>
        </CardContent>
      </Card>

      <HistoricoCard eventos={folha.historicoFolha ?? []} />
    </>
  );
}

/* ------------------------------- Aguardando aprovação ------------------------------- */

type Decisao = null | 'aprovado' | 'rejeitado';

function AguardandoAprovacaoBody({ folha }: { folha: TarefaSaida }) {
  const [decisao, setDecisao] = useState<Decisao>(null);
  const [modoAjustes, setModoAjustes] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [historico, setHistorico] = useState<EventoFolha[]>(folha.historicoFolha ?? []);
  const { arquivos, add, remove } = useArquivos();

  const baixar = () =>
    toast.success('Folha baixada', {
      description: 'Confira os valores e aprove ou solicite ajustes.',
    });

  const aprovar = () => {
    const evento: EventoFolha = {
      id: nextId(),
      autor: 'cliente',
      operador: USUARIO,
      data: new Date().toISOString(),
      tipo: 'aprovacao',
    };
    setHistorico((atual) => [...atual, evento]);
    setDecisao('aprovado');
    toast.success('Folha aprovada', {
      description: 'A contabilidade vai concluir o processamento e disponibilizar o entregável.',
    });
  };

  const solicitarAjustes = () => {
    const evento: EventoFolha = {
      id: nextId(),
      autor: 'cliente',
      operador: USUARIO,
      data: new Date().toISOString(),
      tipo: 'rejeicao',
      mensagem: motivo,
      arquivo:
        arquivos.length > 0
          ? { nome: arquivos[0].nome, legenda: 'Anexo enviado por você' }
          : undefined,
    };
    setHistorico((atual) => [...atual, evento]);
    setDecisao('rejeitado');
    toast.success('Ajustes solicitados', {
      description: 'Enviamos suas observações para a contabilidade revisar a folha.',
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Folha para aprovação</CardTitle>
          <CardDescription>
            A contabilidade enviou uma versão da folha de pagamento. Baixe, confira os valores e
            aprove ou solicite ajustes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {folha.arquivoFolha ? <ArquivoDestaque arquivo={folha.arquivoFolha} /> : null}
          <div>
            <Button variant="outline" onClick={baixar}>
              <Download className="h-4 w-4" />
              Baixar folha
            </Button>
          </div>

          {decisao === null ? (
            <>
              <Separator />
              {modoAjustes ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="folha-motivo">O que precisa ser ajustado?</Label>
                    <Textarea
                      id="folha-motivo"
                      rows={4}
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Ex.: o valor das horas extras do João Pedro está divergente; falta incluir a admissão da Carla…"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Anexo (opcional)</Label>
                    <FileDropzone
                      label="Anexe um arquivo com as observações (opcional)"
                      onFiles={(files) => {
                        const n = add(files);
                        toast.success(n > 1 ? `${n} arquivos anexados` : 'Arquivo anexado');
                      }}
                    />
                    <ArquivoList arquivos={arquivos} onRemove={remove} />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setModoAjustes(false);
                        setMotivo('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button disabled={motivo.trim().length === 0} onClick={solicitarAjustes}>
                      <Send className="h-4 w-4" />
                      Enviar ajustes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-medium text-foreground">
                    Os valores estão corretos?
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button>
                          <CheckCircle2 className="h-4 w-4" />
                          Aprovar folha
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogMedia className="bg-success-subtle text-success-text">
                            <CheckCircle2 className="h-8 w-8" />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Aprovar a folha de pagamento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ao aprovar, você confirma que conferiu os valores e que a folha está
                            correta. A contabilidade vai concluir o processamento e
                            disponibilizar o entregável final.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={aprovar}>
                            Confirmar aprovação
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="outline" onClick={() => setModoAjustes(true)}>
                      <RotateCcw className="h-4 w-4" />
                      Solicitar ajustes
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Separator />
              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
                {decisao === 'aprovado' ? (
                  <>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">Folha aprovada</span>
                      <span className="text-muted-foreground">
                        A contabilidade vai concluir o processamento e disponibilizar o
                        entregável final para download.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">
                        Ajustes enviados para a contabilidade
                      </span>
                      <span className="text-muted-foreground">
                        Nossa equipe vai revisar a folha conforme suas observações e enviar uma
                        nova versão para aprovação.
                      </span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <HistoricoCard eventos={historico} />
    </>
  );
}

/* ------------------------------- Dispatcher ------------------------------- */

export function FolhaPagamentoBody({ folha }: { folha: TarefaSaida }) {
  switch (folha.statusFolha) {
    case 'aprovado':
      return <AprovadaBody folha={folha} />;
    case 'aguardando-aprovacao':
      return <AguardandoAprovacaoBody folha={folha} />;
    case 'em-processamento':
    default:
      return <EmProcessamentoBody folha={folha} />;
  }
}
