import { useState } from 'react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, FileText, MessageSquare, Upload } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Separator,
  Textarea,
} from '@bhubai/bhub-design-system';
import type { DocumentoRejeitado } from '@/types/gpc';
import type { ArquivoItem } from '@/components/gpc/ArquivoList';
import { ArquivoList } from '@/components/gpc/ArquivoList';
import { FileDropzone } from '@/components/gpc/FileDropzone';
import { MensagemOperacao } from '@/components/gpc/detalhe/MensagemOperacao';
import { useArquivos } from '@/lib/useArquivos';

const OPERADOR_PADRAO = { nome: 'Equipe de contabilidade BHub', iniciais: 'BH' };

type Modo = null | 'reenviar' | 'responder';

type Resolucao =
  | { via: 'reenviado'; arquivos: ArquivoItem[]; comentario: string }
  | { via: 'respondido'; resposta: string };

export function RejeitadosBody({ documento }: { documento: DocumentoRejeitado }) {
  const [modo, setModo] = useState<Modo>(null);
  const [resposta, setResposta] = useState('');
  const [comentarioReenvio, setComentarioReenvio] = useState('');
  const [resolucao, setResolucao] = useState<Resolucao | null>(null);
  const { arquivos, add, remove } = useArquivos();

  const resolvido = resolucao !== null;
  const operador = documento.operador ?? OPERADOR_PADRAO;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documento rejeitado</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <FileText className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {documento.nomeArquivo}
            </span>
            <span className="text-xs text-muted-foreground">
              Rejeitado em{' '}
              {format(parseISO(documento.rejeitadoEm), "dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          <Badge variant={resolvido ? 'success' : 'destructive'} className="shrink-0">
            {resolvido ? 'Resolvido' : 'Rejeitado'}
          </Badge>
        </div>

        <MensagemOperacao
          iniciais={operador.iniciais}
          nome={operador.nome}
          data={documento.rejeitadoEm}
          assunto="Motivo da rejeição"
          mensagem={documento.motivo}
        />

        <Separator />

        {resolucao ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  {resolucao.via === 'reenviado'
                    ? 'Arquivos enviados para a contabilidade'
                    : 'Resposta enviada para a contabilidade'}
                </span>
                <span className="text-muted-foreground">
                  {resolucao.via === 'reenviado'
                    ? resolucao.comentario.trim().length > 0
                      ? resolucao.comentario
                      : `${resolucao.arquivos.length} arquivo(s) enviado(s).`
                    : resolucao.resposta}
                </span>
              </div>
            </div>
            {resolucao.via === 'reenviado' ? (
              <ArquivoList arquivos={resolucao.arquivos} />
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-foreground">
              Como deseja regularizar?
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={modo === 'reenviar' ? 'default' : 'outline'}
                onClick={() => setModo('reenviar')}
              >
                <Upload className="h-4 w-4" />
                Reenviar arquivo
              </Button>
              <Button
                size="sm"
                variant={modo === 'responder' ? 'default' : 'outline'}
                onClick={() => setModo('responder')}
              >
                <MessageSquare className="h-4 w-4" />
                Responder
              </Button>
            </div>

            {modo === 'reenviar' ? (
              <div className="flex flex-col gap-4">
                <FileDropzone
                  label="Arraste o arquivo corrigido ou clique para selecionar"
                  onFiles={(files) => {
                    const n = add(files);
                    toast.success(
                      n > 1 ? `${n} arquivos adicionados` : 'Arquivo adicionado'
                    );
                  }}
                />
                <ArquivoList arquivos={arquivos} onRemove={remove} />

                {arquivos.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reenvio-comentario">Comentário (opcional)</Label>
                    <Textarea
                      id="reenvio-comentario"
                      rows={3}
                      value={comentarioReenvio}
                      onChange={(e) => setComentarioReenvio(e.target.value)}
                      placeholder="Deixe um contexto para a contabilidade (opcional)."
                    />
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={arquivos.length === 0}
                    onClick={() => {
                      setResolucao({
                        via: 'reenviado',
                        arquivos,
                        comentario: comentarioReenvio,
                      });
                      toast.success('Arquivos enviados para a contabilidade');
                    }}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            ) : null}

            {modo === 'responder' ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  rows={3}
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  placeholder="Explique para a contabilidade (ex.: a nota foi cancelada, o documento correto é outro…)."
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={resposta.trim().length === 0}
                    onClick={() => {
                      setResolucao({ via: 'respondido', resposta });
                      toast.success('Resposta enviada para a contabilidade');
                    }}
                  >
                    Enviar resposta
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
