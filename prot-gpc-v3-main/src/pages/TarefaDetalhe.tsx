import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Empty } from '@bhubai/bhub-design-system';
import type { TarefaEntrada } from '@/types/gpc';
import {
  contasFinanceiras,
  tarefasEntrada,
  tarefasFechamento,
  tarefasSaida,
  HOJE_SIMULADO,
} from '@/mocks/seed';
import { deriveStatusEntrada } from '@/lib/status';
import type { StatusFolha, TipoEntrada } from '@/types/gpc';
import type { ArquivoItem } from '@/components/gpc/ArquivoList';
import { AjudaCard } from '@/components/gpc/AjudaCard';
import { FolhaStatusBadge } from '@/components/gpc/FolhaStatusBadge';
import { TarefaDetalheShell } from '@/components/gpc/detalhe/TarefaDetalheShell';
import { ExtratosBody } from '@/components/gpc/detalhe/ExtratosBody';
import { UploadComumBody } from '@/components/gpc/detalhe/UploadComumBody';
import { FechamentoBody } from '@/components/gpc/detalhe/FechamentoBody';
import { RejeitadosBody } from '@/components/gpc/detalhe/RejeitadosBody';
import { DocumentacaoPendenteBody } from '@/components/gpc/detalhe/DocumentacaoPendenteBody';
import { GuiaBody } from '@/components/gpc/detalhe/GuiaBody';
import { FolhaPagamentoBody } from '@/components/gpc/detalhe/FolhaPagamentoBody';
import {
  FechamentoContabilBody,
  FechamentoStatusBadge,
} from '@/components/gpc/detalhe/FechamentoContabilBody';

/** Gera N arquivos de exemplo (representando o que já foi enviado no seed). */
function arquivosSeed(qtd: number, prefixo: string): ArquivoItem[] {
  return Array.from({ length: qtd }, (_, i) => ({
    id: `${prefixo}-seed-${i}`,
    nome: `${prefixo}-${i + 1}.pdf`,
    legenda: 'Enviado anteriormente',
  }));
}

/** Distribui os extratos já enviados entre as primeiras contas. */
function extratosSeed(qtd: number): Record<string, ArquivoItem[]> {
  const result: Record<string, ArquivoItem[]> = {};
  for (let i = 0; i < qtd; i++) {
    const conta = contasFinanceiras[i % contasFinanceiras.length];
    const item: ArquivoItem = {
      id: `ext-seed-${i}`,
      nome: `extrato-${conta.banco.toLowerCase()}.pdf`,
      legenda: 'Enviado anteriormente',
    };
    result[conta.id] = [...(result[conta.id] ?? []), item];
  }
  return result;
}

/** Copy de ajuda por tipo de tarefa (Central de Ajuda). */
const AJUDA_ENTRADA: Record<TipoEntrada, string> = {
  extratos: 'Assista nosso vídeo e aprenda na prática como enviar seus extratos bancários.',
  notas: 'Assista nosso vídeo e aprenda na prática como enviar suas notas fiscais.',
  fechamento:
    'Assista nosso vídeo e aprenda na prática como enviar os insumos para o fechamento.',
  rejeitados:
    'Veja como entender o motivo da rejeição e reenviar os documentos corretamente.',
  'documentacao-pendente':
    'Veja como responder às solicitações de documentos da contabilidade e anexar o que falta.',
};

const AJUDA_GUIA = 'Tire suas dúvidas sobre como baixar e pagar suas guias em dia.';

const AJUDA_FOLHA =
  'Saiba como conferir, aprovar ou solicitar ajustes e baixar sua folha de pagamento.';

/** Rótulo do prazo no header da folha por status (aprovada não exibe prazo). */
const FOLHA_PRAZO_LABEL: Record<StatusFolha, string | undefined> = {
  'em-processamento': 'Disponível até',
  'aguardando-aprovacao': 'Prazo para aprovação',
  aprovado: undefined,
};

/** Aviso de prazo encerrado por tipo de tarefa (warning). */
const AVISO_PRAZO: Record<
  TipoEntrada,
  { titulo: string; descricao: React.ReactNode }
> = {
  extratos: {
    titulo: 'Prazo para envio de Extratos bancários encerrado',
    descricao: (
      <>
        Você não enviou nenhum extrato este mês. Você ainda pode enviar seus extratos
        fora do prazo; eles serão analisados pela nossa equipe, que avaliará se haverá
        multas ou cobranças adicionais.{' '}
        <span className="font-semibold text-foreground">
          Caso não tenha movimentação, não se preocupe. A tarefa está concluída!
        </span>
      </>
    ),
  },
  notas: {
    titulo: 'Prazo para envio de Notas fiscais encerrado',
    descricao: (
      <>
        Você não enviou nenhuma nota fiscal este mês. Você ainda pode enviar suas notas
        fora do prazo; elas serão analisadas pela nossa equipe, que avaliará se haverá
        multas ou cobranças adicionais.{' '}
        <span className="font-semibold text-foreground">
          Caso não tenha notas, não se preocupe. A tarefa está concluída!
        </span>
      </>
    ),
  },
  fechamento: {
    titulo: 'Prazo para envio dos Insumos para fechamento encerrado',
    descricao: (
      <>
        Você não enviou os insumos para fechamento este mês. Você ainda pode enviá-los
        fora do prazo; eles serão analisados pela nossa equipe, que avaliará se haverá
        multas ou cobranças adicionais.{' '}
        <span className="font-semibold text-foreground">
          Caso não tenha insumos, não se preocupe. A tarefa está concluída!
        </span>
      </>
    ),
  },
  rejeitados: {
    titulo: 'Prazo para regularização dos documentos rejeitados encerrado',
    descricao: (
      <>
        Os documentos rejeitados ainda não foram regularizados. Você ainda pode reenviá-los
        ou responder fora do prazo; o material será analisado pela nossa equipe, que
        avaliará se haverá multas ou cobranças adicionais.
      </>
    ),
  },
  'documentacao-pendente': {
    titulo: 'Prazo para envio da documentação pendente encerrado',
    descricao: (
      <>
        A documentação solicitada pela contabilidade ainda não foi enviada. Você ainda pode
        enviá-la ou responder fora do prazo; o material será analisado pela nossa equipe,
        que avaliará se haverá multas ou cobranças adicionais.
      </>
    ),
  },
};

function EntradaBody({ tarefa }: { tarefa: TarefaEntrada }) {
  switch (tarefa.tipo) {
    case 'extratos':
      return (
        <ExtratosBody
          contas={contasFinanceiras}
          iniciais={extratosSeed(tarefa.arquivos)}
          prazo={tarefa.prazo}
          arquivosEnviados={tarefa.arquivos}
        />
      );
    case 'notas':
      return (
        <UploadComumBody
          uploadTitulo="Enviar notas fiscais"
          uploadDescricao="Anexe as notas fiscais emitidas no mês."
          listaTitulo="Notas enviadas"
          listaVazia="Você ainda não enviou nenhuma nota fiscal nesta tarefa."
          iniciais={arquivosSeed(tarefa.arquivos, 'nota')}
        />
      );
    case 'fechamento':
      return <FechamentoBody iniciais={arquivosSeed(tarefa.arquivos, 'doc')} />;
    case 'rejeitados':
      return tarefa.documentoRejeitado ? (
        <RejeitadosBody documento={tarefa.documentoRejeitado} />
      ) : null;
    case 'documentacao-pendente':
      return tarefa.solicitacao ? (
        <DocumentacaoPendenteBody solicitacao={tarefa.solicitacao} />
      ) : null;
    default:
      return null;
  }
}

function NaoEncontrada() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para as tarefas
      </Button>
      <Empty
        title="Tarefa não encontrada"
        description="Esta tarefa não existe ou não está mais disponível."
      />
    </div>
  );
}

export function TarefaDetalhe() {
  const { id } = useParams<{ id: string }>();

  const entrada = tarefasEntrada.find((t) => t.id === id);
  if (entrada) {
    return (
      <TarefaDetalheShell
        titulo={entrada.titulo}
        status={deriveStatusEntrada(entrada, HOJE_SIMULADO)}
        descricao={entrada.descricao}
        prazo={entrada.prazo}
        prazoLabel="Prazo limite"
        aside={<AjudaCard descricao={AJUDA_ENTRADA[entrada.tipo]} />}
        avisoPrazoEncerrado={AVISO_PRAZO[entrada.tipo]}
        hideComentario={
          entrada.tipo === 'documentacao-pendente' || entrada.tipo === 'rejeitados'
        }
      >
        <EntradaBody tarefa={entrada} />
      </TarefaDetalheShell>
    );
  }

  const fechamento = tarefasFechamento.find((t) => t.id === id);
  if (fechamento) {
    const concluido = fechamento.status === 'concluido';
    return (
      <TarefaDetalheShell
        titulo={fechamento.titulo}
        // 'nao-iniciada' suprime os avisos de prazo/conclusão das entradas; o
        // status real do fechamento vai pelo statusBadge abaixo.
        status="nao-iniciada"
        statusBadge={<FechamentoStatusBadge status={fechamento.status} />}
        descricao={fechamento.descricao}
        prazo={concluido ? fechamento.fechadoEm : fechamento.prazo}
        prazoLabel={concluido ? 'Concluído em' : 'Previsão de conclusão'}
        aside={
          <AjudaCard descricao="Entenda como acompanhar o fechamento do seu mês e o que fazer quando algo depende de você." />
        }
        hideComentario
      >
        <FechamentoContabilBody tarefa={fechamento} />
      </TarefaDetalheShell>
    );
  }

  const guia = tarefasSaida.find((t) => t.id === id);
  if (guia) {
    if (guia.subtipo === 'folha-pagamento') {
      const statusFolha = guia.statusFolha ?? 'em-processamento';
      const prazoLabel = FOLHA_PRAZO_LABEL[statusFolha];
      return (
        <TarefaDetalheShell
          titulo={guia.titulo}
          // Status neutro: a folha tem badge próprio e não usa os avisos de prazo.
          status="nao-iniciada"
          prazo={prazoLabel ? guia.prazo : undefined}
          prazoLabel={prazoLabel}
          statusBadge={<FolhaStatusBadge status={statusFolha} />}
          hideComentario
          aside={<AjudaCard descricao={AJUDA_FOLHA} />}
        >
          <FolhaPagamentoBody folha={guia} />
        </TarefaDetalheShell>
      );
    }

    return (
      <TarefaDetalheShell
        titulo={guia.titulo}
        status={guia.status}
        prazo={guia.prazo}
        prazoLabel="Vencimento"
        hideStatus
        aside={<AjudaCard descricao={AJUDA_GUIA} />}
      >
        <GuiaBody guia={guia} />
      </TarefaDetalheShell>
    );
  }

  return <NaoEncontrada />;
}
