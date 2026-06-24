import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, CheckCircle2, CircleAlert, Info } from 'lucide-react';
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
  Textarea,
  cn,
} from '@bhubai/bhub-design-system';
import type { StatusTarefa } from '@/types/gpc';
import { HOJE_SIMULADO } from '@/mocks/seed';
import { StatusBadge } from '@/components/gpc/StatusBadge';

type Status = StatusTarefa | 'calculando';

interface Props {
  titulo: string;
  status: Status;
  descricao?: string;
  prazo?: string;
  /** Rótulo do prazo (ex.: "Prazo limite" para entradas, "Vencimento" para guias). */
  prazoLabel?: string;
  /** Esconde o StatusBadge (guias não têm status de conclusão). */
  hideStatus?: boolean;
  /**
   * Badge de status customizado ao lado do título (ex.: status próprio da
   * folha de pagamento ou do fechamento). Quando fornecido, substitui o
   * StatusBadge padrão.
   */
  statusBadge?: React.ReactNode;
  /** Conteúdo da coluna lateral direita (ex.: card da Central de Ajuda). */
  aside?: React.ReactNode;
  /** Aviso (destructive) exibido quando a tarefa está atrasada, adaptado por tipo. */
  avisoPrazoEncerrado?: { titulo: string; descricao: React.ReactNode };
  /** Esconde o card de comentário ao final (ex.: tarefas com resposta própria). */
  hideComentario?: boolean;
  children: React.ReactNode;
}

export function TarefaDetalheShell({
  titulo,
  status,
  descricao,
  prazo,
  prazoLabel = 'Prazo limite',
  hideStatus = false,
  statusBadge,
  aside,
  avisoPrazoEncerrado,
  hideComentario = false,
  children,
}: Props) {
  const navigate = useNavigate();
  const [comentario, setComentario] = useState('');

  const prazoVencido = prazo
    ? isAfter(startOfDay(HOJE_SIMULADO), startOfDay(parseISO(prazo)))
    : false;
  const concluidaNoPrazo = status === 'concluida' && !prazoVencido;
  const badgeStatus = concluidaNoPrazo ? 'concluida-no-prazo' : status;

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col gap-6',
        aside ? 'max-w-[1100px]' : 'max-w-[760px]'
      )}
    >
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para as tarefas
        </Button>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold leading-8 text-foreground">{titulo}</h1>
            {hideStatus ? null : (statusBadge ?? <StatusBadge status={badgeStatus} />)}
          </div>
          {descricao ? (
            <p className="text-base leading-6 text-muted-foreground">{descricao}</p>
          ) : null}
          {prazo ? (
            <p className="text-sm text-muted-foreground">
              {prazoLabel}:{' '}
              <span className="font-medium text-foreground">
                {format(parseISO(prazo), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          aside
            ? 'grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]'
            : 'flex flex-col gap-6'
        )}
      >
        <div className="flex flex-col gap-6">
          {status === 'atrasada' ? (
            <Alert variant="warning">
              <CircleAlert className="h-4 w-4" />
              <AlertTitle>
                {avisoPrazoEncerrado?.titulo ?? 'Prazo para envio encerrado'}
              </AlertTitle>
              <AlertDescription className="text-muted-foreground">
                {avisoPrazoEncerrado?.descricao ?? (
                  <>
                    Você ainda pode enviar fora do prazo; o material será analisado pela
                    nossa equipe, que avaliará se haverá multas ou cobranças adicionais.
                  </>
                )}
              </AlertDescription>
            </Alert>
          ) : null}

          {concluidaNoPrazo ? (
            <Alert variant="info">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>
                Você pode continuar enviando arquivos
              </AlertTitle>
              <AlertDescription>
                Como o prazo ainda está aberto, você pode continuar enviando arquivos até
                a data limite — eles entram na lista e seguem automaticamente para a
                operação. Não é preciso finalizar a tarefa: ela se encerra
                automaticamente quando o prazo chegar.
              </AlertDescription>
            </Alert>
          ) : null}

          {children}

          {hideComentario ? null : (
            <Card>
              <CardHeader>
                <CardTitle>Comentário</CardTitle>
                <CardDescription>
                  Deixe um contexto para a operação da contabilidade (opcional).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Label htmlFor="comentario" className="sr-only">
                  Comentário
                </Label>
                <Textarea
                  id="comentario"
                  rows={4}
                  placeholder="Ex.: detalhes do período, banco de origem, justificativa do atraso…"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
                {comentario.trim().length > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" />
                    Seu comentário será enviado junto com os documentos.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>

        {aside ? (
          <aside className="h-fit lg:sticky lg:top-14">{aside}</aside>
        ) : null}
      </div>
    </div>
  );
}
