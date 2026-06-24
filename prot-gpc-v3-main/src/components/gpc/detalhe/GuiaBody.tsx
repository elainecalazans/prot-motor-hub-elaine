import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, FolderOpen } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  LinkButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@bhubai/bhub-design-system';
import type { RegistroDownload, TarefaSaida, TipoRegistroGuia } from '@/types/gpc';
import { USUARIO_GUIA_ATUAL, useGuiasPagas } from '@/hooks/useGuiasPagas';
import { ConfirmarPagamentoGuiaDialog } from './ConfirmarPagamentoGuiaDialog';

let counter = 0;
const nextId = () => `dl-${Date.now()}-${counter++}`;

const ACAO_LABEL: Record<TipoRegistroGuia, string> = {
  download: 'Download da guia',
  'marcado-como-pago': 'Marcado como pago',
};

function formatValor(valor?: number) {
  if (valor === undefined) return '—';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function normalizarRegistro(registro: RegistroDownload): RegistroDownload {
  return {
    ...registro,
    tipo: registro.tipo ?? 'download',
  };
}

export function GuiaBody({ guia }: { guia: TarefaSaida }) {
  const navigate = useNavigate();
  const { isPaga, marcarComoPaga, getMarcacoes } = useGuiasPagas();
  const [dialogPagamentoAberto, setDialogPagamentoAberto] = useState(false);
  const [downloads, setDownloads] = useState<RegistroDownload[]>(() =>
    (guia.downloads ?? []).map(normalizarRegistro)
  );

  const disponivel = guia.status !== 'calculando';
  const paga = !!guia.marcadaComoPaga || isPaga(guia.id);
  const podeMarcarPaga = disponivel && !paga;

  const historico = useMemo(() => {
    const marcacoes = getMarcacoes(guia.id).map(normalizarRegistro);
    return [...downloads, ...marcacoes].sort((a, b) => b.baixadoEm.localeCompare(a.baixadoEm));
  }, [downloads, getMarcacoes, guia.id]);

  const baixar = () => {
    const registro: RegistroDownload = {
      id: nextId(),
      tipo: 'download',
      usuario: USUARIO_GUIA_ATUAL.usuario,
      iniciais: USUARIO_GUIA_ATUAL.iniciais,
      baixadoEm: new Date().toISOString(),
    };
    setDownloads((current) => [registro, ...current]);
    toast.success('Guia baixada', { description: 'Registramos o download no histórico.' });
  };

  const handleConfirmarPagamento = () => {
    const registro = marcarComoPaga(guia.id);
    if (registro) {
      toast.success('Guia marcada como paga');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Guia para pagamento</CardTitle>
          <CardDescription>
            Baixe a guia e efetue o pagamento até o vencimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Valor</span>
              <span className="text-lg font-semibold text-foreground">
                {formatValor(guia.valor)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Vencimento</span>
              <span className="text-lg font-semibold text-foreground">
                {guia.prazo
                  ? format(parseISO(guia.prazo), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : '—'}
              </span>
            </div>
          </div>

          {guia.linhaDigitavel ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Linha digitável</span>
              <code className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">
                {guia.linhaDigitavel}
              </code>
            </div>
          ) : null}

          {disponivel ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={baixar}>
                <Download className="h-4 w-4" />
                Baixar guia
              </Button>
              {podeMarcarPaga ? (
                <Button variant="outline" onClick={() => setDialogPagamentoAberto(true)}>
                  Marcar como paga
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
          <CardDescription>
            Downloads e marcações de pagamento registrados pela sua equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <Empty
              title="Nenhuma ação ainda"
              description="Quando alguém baixar a guia ou marcar como paga, o registro aparece aqui."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead className="text-right">Data e hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historico.map((item) => {
                  const tipo = item.tipo ?? 'download';
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarFallback>{item.iniciais}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">
                            {item.usuario}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{ACAO_LABEL[tipo]}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {format(parseISO(item.baixadoEm), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <FolderOpen className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium text-foreground">
              Guias de meses anteriores
            </span>
            <span className="text-xs text-muted-foreground">
              Encontre todas as guias deste tipo em Documentos e relatórios.
            </span>
          </div>
          <LinkButton onClick={() => navigate('/documentos')}>Ver todas</LinkButton>
        </CardContent>
      </Card>

      <ConfirmarPagamentoGuiaDialog
        open={dialogPagamentoAberto}
        onOpenChange={setDialogPagamentoAberto}
        onConfirm={handleConfirmarPagamento}
      />
    </>
  );
}
