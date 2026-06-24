import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Info } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
} from '@bhubai/bhub-design-system';
import type { SolicitacaoDocumento } from '@/types/gpc';
import { ArquivoList } from '@/components/gpc/ArquivoList';
import { FileDropzone } from '@/components/gpc/FileDropzone';
import { MensagemOperacao } from '@/components/gpc/detalhe/MensagemOperacao';
import { useArquivos } from '@/lib/useArquivos';

/**
 * Corpo da tarefa "Documentação pendente". A contabilidade identificou que
 * falta algum documento para o fechamento do mês e abriu uma solicitação. O
 * cliente lê a mensagem da operação (formato de e-mail) e responde anexando
 * documentos e/ou escrevendo uma mensagem de volta.
 */
export function DocumentacaoPendenteBody({
  solicitacao,
}: {
  solicitacao: SolicitacaoDocumento;
}) {
  const { arquivos, add, remove } = useArquivos();
  const [mensagem, setMensagem] = useState('');
  const [enviado, setEnviado] = useState(false);

  const podeEnviar = arquivos.length > 0 || mensagem.trim().length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Solicitação da contabilidade</CardTitle>
          <CardDescription>
            Nossa equipe identificou que falta documentação para concluir o fechamento
            mensal e enviou a solicitação abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MensagemOperacao
            iniciais={solicitacao.operador.iniciais}
            nome={solicitacao.operador.nome}
            data={solicitacao.enviadoEm}
            assunto={solicitacao.assunto}
            mensagem={solicitacao.mensagem}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responder à solicitação</CardTitle>
          <CardDescription>
            Anexe os documentos solicitados e/ou escreva uma resposta para a contabilidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {enviado ? (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  Resposta enviada para a contabilidade
                </span>
                <span className="text-muted-foreground">
                  Nossa equipe vai analisar o material e seguir com o fechamento.
                </span>
              </div>
            </div>
          ) : (
            <>
              <FileDropzone
                onFiles={(files) => {
                  const n = add(files);
                  toast.success(n > 1 ? `${n} arquivos anexados` : 'Arquivo anexado');
                }}
              />

              <ArquivoList arquivos={arquivos} onRemove={remove} />

              <div className="flex flex-col gap-2">
                <Label htmlFor="resposta-operador">Mensagem para a contabilidade</Label>
                <Textarea
                  id="resposta-operador"
                  rows={4}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Ex.: segue o comprovante solicitado. O contrato atualizado ainda está em assinatura, envio até sexta."
                />
                {mensagem.trim().length > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" />
                    Sua resposta será enviada para o operador responsável.
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!podeEnviar}
                  onClick={() => {
                    setEnviado(true);
                    toast.success('Resposta enviada para a contabilidade');
                  }}
                >
                  Enviar para a contabilidade
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
