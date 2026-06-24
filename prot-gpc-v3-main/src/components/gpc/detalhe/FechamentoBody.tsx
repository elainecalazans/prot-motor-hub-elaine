import { Ban, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@bhubai/bhub-design-system';
import type { ArquivoItem } from '@/components/gpc/ArquivoList';
import { UploadComumBody } from './UploadComumBody';

/** Insumos aceitos nesta tarefa (lista ilustrativa, não exaustiva). */
const INCLUIR = [
  'Recibos',
  'Comprovantes de pagamento',
  'Contratos',
  'Invoices',
  'Outros documentos financeiros do período',
];

/** Documentos que têm tarefa própria e não devem ser enviados aqui. */
const EXCLUIR = [
  'Notas fiscais emitidas',
  'Extratos bancários',
  'Documentos de departamento pessoal',
];

/**
 * Corpo da tarefa "Insumos para fechamento". O cliente envia os documentos
 * necessários para o fechamento contábil do período (recibos, comprovantes,
 * contratos, invoices, etc.), orientado sobre o que enviar e o que deixar de
 * fora — pois há tarefas específicas para notas, extratos e dep. pessoal.
 */
export function FechamentoBody({ iniciais }: { iniciais?: ArquivoItem[] }) {
  return (
    <UploadComumBody
      uploadTitulo="Enviar insumos para fechamento"
      uploadDescricao="Anexe os documentos necessários para o fechamento da empresa no período."
      listaTitulo="Insumos enviados"
      listaVazia="Você ainda não enviou nenhum insumo nesta tarefa."
      iniciais={iniciais}
      orientacao={
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">O que enviar aqui</span>
            <ul className="flex flex-col gap-1.5">
              {INCLUIR.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Alert variant="warning">
            <Ban className="h-4 w-4" />
            <AlertTitle>Não envie estes documentos aqui</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              <ul className="flex list-disc flex-col gap-0.5 pl-4">
                {EXCLUIR.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <span>
                Cada um deles tem uma tarefa específica — envie por lá para não duplicar o
                trabalho.
              </span>
            </AlertDescription>
          </Alert>
        </div>
      }
    />
  );
}
