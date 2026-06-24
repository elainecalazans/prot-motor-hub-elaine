import { Download, Eye, FileText, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  IconButton,
} from '@bhubai/bhub-design-system';

export interface ArquivoItem {
  id: string;
  nome: string;
  /** Tamanho em bytes (quando disponível). */
  tamanho?: number;
  /** Legenda secundária alternativa ao tamanho (ex.: data de envio). */
  legenda?: string;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  arquivos: ArquivoItem[];
  onRemove?: (id: string) => void;
}

/** Lista de arquivos enviados, com ícone, legenda e ações (ver, baixar, remover). */
export function ArquivoList({ arquivos, onRemove }: Props) {
  if (arquivos.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {arquivos.map((arquivo) => {
        const legenda =
          arquivo.legenda ??
          (arquivo.tamanho !== undefined ? formatBytes(arquivo.tamanho) : undefined);
        return (
          <li
            key={arquivo.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FileText className="h-4 w-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {arquivo.nome}
              </span>
              {legenda ? (
                <span className="text-xs text-muted-foreground">{legenda}</span>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {/* TODO(protótipo): visualização ainda não funcional — placeholders. */}
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Visualizar ${arquivo.nome}`}
              >
                <Eye className="h-4 w-4" />
              </IconButton>
              {/* TODO(protótipo): download ainda não funcional — placeholders. */}
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Baixar ${arquivo.nome}`}
              >
                <Download className="h-4 w-4" />
              </IconButton>
              {onRemove ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remover ${arquivo.nome}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover este arquivo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O arquivo <strong>{arquivo.nome}</strong> pode já ter sido
                        enviado para a contabilidade. Ao removê-lo, vamos criar uma
                        solicitação para que ele seja desconsiderado no processamento.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => onRemove(arquivo.id)}
                      >
                        Remover arquivo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
