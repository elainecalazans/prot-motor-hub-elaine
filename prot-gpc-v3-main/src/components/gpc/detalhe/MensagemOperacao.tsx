import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail } from 'lucide-react';
import { Avatar, AvatarFallback } from '@bhubai/bhub-design-system';

interface Props {
  iniciais: string;
  nome: string;
  /** Data de envio (ISO) exibida no cabeçalho. */
  data: string;
  assunto: string;
  mensagem: string;
  /** Subtítulo do remetente. */
  subtitulo?: string;
}

/**
 * Mensagem da operação no formato de e-mail: cabeçalho com remetente (avatar +
 * nome + data) e corpo com assunto e texto. Usada nas tarefas em que a
 * contabilidade se comunica com o cliente — documentação pendente, motivo da
 * rejeição, etc. — para manter o mesmo padrão visual.
 */
export function MensagemOperacao({
  iniciais,
  nome,
  data,
  assunto,
  mensagem,
  subtitulo = 'Equipe de contabilidade BHub',
}: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <Avatar size="sm">
          <AvatarFallback>{iniciais}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{nome}</span>
          <span className="text-xs text-muted-foreground">{subtitulo}</span>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {format(parseISO(data), "dd 'de' MMMM", { locale: ptBR })}
        </span>
      </div>
      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {assunto}
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {mensagem}
        </p>
      </div>
    </div>
  );
}
