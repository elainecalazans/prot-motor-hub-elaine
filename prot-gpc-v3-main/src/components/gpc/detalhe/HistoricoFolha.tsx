import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, FileText, History, MessageSquare, RotateCcw } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Empty,
  cn,
} from '@bhubai/bhub-design-system';
import type { EventoFolha } from '@/types/gpc';
import { ArquivoList } from '@/components/gpc/ArquivoList';

type BadgeInfo = {
  label: string;
  icon: typeof Check;
  variant: 'secondary' | 'warning' | 'success' | 'info';
};

/** Badges dos eventos do cliente (versões da BHub são tratadas à parte). */
const badgeCliente: Partial<Record<EventoFolha['tipo'], BadgeInfo>> = {
  rejeicao: { label: 'Ajustes solicitados', icon: RotateCcw, variant: 'warning' },
  aprovacao: { label: 'Aprovada', icon: Check, variant: 'success' },
  comentario: { label: 'Comentário', icon: MessageSquare, variant: 'secondary' },
};

/**
 * Timeline das trocas da folha de pagamento entre a BHub e o cliente, do mais
 * recente para o mais antigo. As versões enviadas pela BHub são diferenciadas
 * entre a **vigente** ("Versão atual", em destaque) e as **substituídas**
 * ("Versão anterior", apagadas), para deixar claro qual documento vale.
 */
export function HistoricoFolha({ eventos }: { eventos: EventoFolha[] }) {
  if (eventos.length === 0) {
    return (
      <Empty
        title="Nenhuma troca ainda"
        description="Quando a BHub enviar uma versão e vocês trocarem mensagens, o histórico aparece aqui."
      />
    );
  }

  // Versão vigente = a última versão enviada pela BHub (maior data).
  const versoes = eventos.filter((e) => e.tipo === 'versao-enviada');
  const idVersaoAtual =
    versoes.length > 0
      ? versoes.reduce((maisRecente, e) => (e.data > maisRecente.data ? e : maisRecente)).id
      : null;

  // Mais recente no topo.
  const ordenados = [...eventos].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <ol className="flex flex-col gap-3">
      {ordenados.map((evento) => {
        const doCliente = evento.autor === 'cliente';
        const papel = doCliente ? 'Você' : 'Equipe de folha BHub';

        const badge: BadgeInfo =
          evento.tipo === 'versao-enviada'
            ? evento.id === idVersaoAtual
              ? { label: 'Versão atual', icon: FileText, variant: 'info' }
              : { label: 'Versão anterior', icon: History, variant: 'secondary' }
            : badgeCliente[evento.tipo] ?? {
                label: 'Comentário',
                icon: MessageSquare,
                variant: 'secondary',
              };
        const Icon = badge.icon;
        const versaoSubstituida = evento.tipo === 'versao-enviada' && evento.id !== idVersaoAtual;

        return (
          <li
            key={evento.id}
            className={cn(
              'flex flex-col gap-3 rounded-lg border border-border bg-card p-4',
              doCliente && 'border-l-2 border-l-mizu-flow-bold',
              versaoSubstituida && 'opacity-70'
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar size="sm">
                <AvatarFallback>{evento.operador.iniciais}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {evento.operador.nome}
                </span>
                <span className="text-xs text-muted-foreground">{papel}</span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant={badge.variant} className="gap-1">
                  <Icon className="h-3 w-3" />
                  {badge.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(evento.data), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>

            {evento.mensagem ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {evento.mensagem}
              </p>
            ) : null}

            {evento.arquivo ? (
              <ArquivoList
                arquivos={[
                  {
                    id: `${evento.id}-arq`,
                    nome: evento.arquivo.nome,
                    legenda: evento.arquivo.legenda,
                  },
                ]}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
