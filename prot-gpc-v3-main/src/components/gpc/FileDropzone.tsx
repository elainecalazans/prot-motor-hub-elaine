import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@bhubai/bhub-design-system';

interface Props {
  /** Chamado com os arquivos selecionados/soltos. */
  onFiles: (files: FileList) => void;
  label?: string;
  hint?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Área de drag & drop + clique para selecionar arquivos. Apenas captura os
 * arquivos e os repassa via `onFiles`; o gerenciamento da lista fica com o
 * componente pai.
 */
export function FileDropzone({
  onFiles,
  label = 'Arraste arquivos ou clique para selecionar',
  hint = 'PDF, imagens, planilhas ou XML — até 10 MB por arquivo',
  multiple = true,
  disabled = false,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          disabled
            ? 'cursor-not-allowed border-input opacity-60'
            : isDragging
              ? 'border-primary bg-accent'
              : 'border-input hover:border-primary/60 hover:bg-accent/50',
          className
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UploadCloud className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </>
  );
}
