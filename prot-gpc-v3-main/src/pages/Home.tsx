import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSameDay, parseISO } from 'date-fns';
import { FileText, Inbox, Upload } from 'lucide-react';
import { Button, TooltipProvider } from '@bhubai/bhub-design-system';
import {
  tarefasEntrada,
  tarefasFechamento,
  tarefasSaida,
  COMPETENCIA_ATUAL,
  COMPETENCIA_FALHA_SIMULADA,
  HOJE_SIMULADO,
} from '@/mocks/seed';
import type { TarefaEntrada } from '@/types/gpc';
import { formatMesCompetencia, toCompetencia } from '@/lib/competencia';
import { deriveStatusEntrada } from '@/lib/status';
import { SectionTable } from '@/components/gpc/SectionTable';
import { BlocoVazio } from '@/components/gpc/BlocoVazio';
import { BlocoErro } from '@/components/gpc/BlocoErro';
import {
  TarefaEntradaCard,
  GuiaCard,
  FolhaCard,
  FechamentoCard,
} from '@/components/gpc/TarefaCard';
import { WarningAlert } from '@/components/gpc/WarningAlert';
import { CompetenciaCalendar } from '@/components/gpc/CompetenciaCalendar';
import { TaskProgress } from '@/components/gpc/TaskProgress';
import { EntregavelProgress } from '@/components/gpc/EntregavelProgress';
import { useGuiasPagas } from '@/hooks/useGuiasPagas';

export function Home() {
  const navigate = useNavigate();
  const [competencia, setCompetencia] = useState(COMPETENCIA_ATUAL);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { isPaga } = useGuiasPagas();

  const mes = useMemo(() => formatMesCompetencia(competencia), [competencia]);

  // Mês com falha de carregamento simulada: os blocos exibem o estado de erro
  // (mensagem + "Recarregar") em vez das listas, e o calendário fica sem marcações.
  const comFalha = competencia === COMPETENCIA_FALHA_SIMULADA;

  const entradas = useMemo(
    () =>
      tarefasEntrada
        .filter((t) => t.competencia === competencia)
        .sort((a, b) => {
          // Ordem por grupos: abertas (0) → concluídas (1) → canceladas (2),
          // para o cliente não perder de vista os prazos pendentes e ver as
          // canceladas por último. Dentro de cada grupo, mantém a ordem por data.
          const rank = (t: TarefaEntrada) =>
            t.cancelada ? 2 : deriveStatusEntrada(t, HOJE_SIMULADO) === 'concluida' ? 1 : 0;
          const ra = rank(a);
          const rb = rank(b);
          if (ra !== rb) return ra - rb;
          return a.prazo.localeCompare(b.prazo);
        }),
    [competencia]
  );
  const guias = useMemo(
    () =>
      tarefasSaida
        .filter((t) => t.competencia === competencia)
        .sort((a, b) => (a.prazo ?? '').localeCompare(b.prazo ?? '')),
    [competencia]
  );
  const fechamentos = useMemo(
    () => tarefasFechamento.filter((t) => t.competencia === competencia),
    [competencia]
  );

  // Canceladas não entram no progresso (não são concluídas nem pendentes).
  const ativas = entradas.filter((t) => !t.cancelada);
  const concluidas = ativas.filter(
    (t) => deriveStatusEntrada(t, HOJE_SIMULADO) === 'concluida'
  ).length;
  const total = ativas.length;
  const vencidas = ativas.filter(
    (t) => deriveStatusEntrada(t, HOJE_SIMULADO) === 'atrasada'
  ).length;

  // Entregáveis que dependem de uma ação do cliente agora: fechamento com
  // movimentações não identificadas e folha aguardando aprovação. Contamos
  // entregáveis (não pendências individuais) — é o que o badge do título resume.
  const entregaveisAguardando = useMemo(() => {
    const fechamentosPendentes = fechamentos.filter(
      (f) => f.movimentacoes.length > 0
    ).length;
    const folhasAguardando = guias.filter(
      (g) => g.subtipo === 'folha-pagamento' && g.statusFolha === 'aguardando-aprovacao'
    ).length;
    return fechamentosPendentes + folhasAguardando;
  }, [fechamentos, guias]);

  // Entregáveis prontos para o cliente usar agora (baixar/pagar/ver final):
  // guias já apuradas (≠ calculando), folha aprovada e fechamento concluído. O
  // que ainda está em produção ou depende de uma ação fica de fora (este último
  // já é contado em "aguarda você").
  const totalEntregaveis = guias.length + fechamentos.length;
  const entregaveisDisponiveis = useMemo(() => {
    const guiasDisponiveis = guias.filter((g) =>
      g.subtipo === 'folha-pagamento'
        ? g.statusFolha === 'aprovado'
        : g.status !== 'calculando'
    ).length;
    const fechamentosDisponiveis = fechamentos.filter(
      (f) => f.status === 'concluido'
    ).length;
    return guiasDisponiveis + fechamentosDisponiveis;
  }, [guias, fechamentos]);

  const isHighlighted = (prazo?: string) => {
    if (!selectedDate || !prazo) return false;
    return isSameDay(parseISO(prazo), selectedDate);
  };

  return (
    <TooltipProvider>
    <div className="mx-auto flex w-full max-w-[1310px] flex-col gap-6">
      <header className="flex items-end justify-between gap-6 pt-2">
        <div className="flex max-w-[680px] flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-8 text-[#181d27]">Tarefas</h1>
          <p className="text-base leading-6 text-[#535862]">
            Realize e acompanhe suas tarefas de cada mês
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => navigate('/envio-fora-do-prazo')}
        >
          <Upload className="h-4 w-4" />
          Envio de documento fora do prazo
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[374px_1fr]">
        <aside className="flex flex-col gap-4">
          <CompetenciaCalendar
            competencia={competencia}
            tarefas={comFalha ? [] : [...entradas, ...guias, ...fechamentos]}
            selected={selectedDate}
            onSelect={setSelectedDate}
            onMonthChange={(d) => {
              setCompetencia(toCompetencia(d));
              setSelectedDate(null);
            }}
          />
          <WarningAlert
            title="As Tarefas estão em constante evolução"
            description="Algumas tarefas podem não estar listadas aqui, mas continuaremos te avisando de todas por e-mail ou WhatsApp"
          />
        </aside>

        <div className="flex flex-col gap-6">
          <SectionTable
            // key por competência: ao trocar de mês a lista é outra, então a
            // expansão do "Ver mais" volta ao estado inicial (6 itens).
            key={`entradas-${competencia}`}
            title={
              <h2 className="text-base font-semibold leading-6 text-[#0a0a0a]">
                Suas tarefas de {mes}
              </h2>
            }
            info="As tarefas de entrada do mês: os documentos e informações que você envia para a contabilidade. É com eles que processamos as obrigações fiscais e contábeis da sua empresa."
            infoLabel="Sobre as tarefas de entrada"
            maxVisible={6}
            itemNoun={{ singular: 'tarefa', plural: 'tarefas' }}
            action={
              !comFalha && total > 0 ? (
                <TaskProgress concluidas={concluidas} total={total} vencidas={vencidas} />
              ) : undefined
            }
          >
            {comFalha ? (
              <BlocoErro recurso="suas tarefas" />
            ) : entradas.length > 0 ? (
              entradas.map((t) => (
                <TarefaEntradaCard
                  key={t.id}
                  tarefa={t}
                  highlighted={isHighlighted(t.prazo)}
                  onOpen={(tarefa) => navigate(`/tarefas/${tarefa.id}`)}
                />
              ))
            ) : (
              <BlocoVazio
                icon={Inbox}
                titulo="Nenhuma tarefa neste mês"
                descricao="Não há tarefas para esta competência. Quando a BHub precisar de algum documento ou informação sua, ela aparece aqui."
              />
            )}
          </SectionTable>

          <SectionTable
            key={`entregaveis-${competencia}`}
            title={
              <h2 className="text-base font-semibold leading-6 text-[#0a0a0a]">
                Entregáveis de {mes}
              </h2>
            }
            info="O que a sua contabilidade preparou neste mês: guias para pagamento e documentos já processados, prontos para a sua empresa usar."
            infoLabel="Sobre os entregáveis"
            maxVisible={6}
            itemNoun={{ singular: 'entregável', plural: 'entregáveis' }}
            action={
              !comFalha && totalEntregaveis > 0 ? (
                <EntregavelProgress
                  disponiveis={entregaveisDisponiveis}
                  total={totalEntregaveis}
                  aguardando={entregaveisAguardando}
                />
              ) : undefined
            }
          >
            {comFalha ? (
              <BlocoErro recurso="seus entregáveis" />
            ) : totalEntregaveis > 0 ? (
              // Array (não Fragment) para o React.Children.toArray do SectionTable
              // achatar e contar cada card — é o que mantém a paginação "Ver mais".
              [
                ...fechamentos.map((f) => (
                  <FechamentoCard
                    key={f.id}
                    tarefa={f}
                    highlighted={isHighlighted(f.prazo)}
                    onOpen={(tarefa) => navigate(`/tarefas/${tarefa.id}`)}
                  />
                )),
                ...guias.map((g) =>
                  g.subtipo === 'folha-pagamento' ? (
                    <FolhaCard
                      key={g.id}
                      tarefa={g}
                      highlighted={isHighlighted(g.prazo)}
                      onOpen={(tarefa) => navigate(`/tarefas/${tarefa.id}`)}
                    />
                  ) : (
                    <GuiaCard
                      key={g.id}
                      tarefa={{
                        ...g,
                        marcadaComoPaga: g.marcadaComoPaga || isPaga(g.id),
                      }}
                      highlighted={isHighlighted(g.prazo)}
                      onOpen={(tarefa) => navigate(`/tarefas/${tarefa.id}`)}
                    />
                  )
                ),
              ]
            ) : (
              <BlocoVazio
                icon={FileText}
                titulo="Nenhum entregável neste mês"
                descricao="Não há entregáveis para esta competência. Suas guias e documentos aparecem aqui assim que a BHub preparar."
              />
            )}
          </SectionTable>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
