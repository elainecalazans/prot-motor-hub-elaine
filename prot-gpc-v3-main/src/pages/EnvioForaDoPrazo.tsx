import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, FileText, Info, UploadCloud, X } from 'lucide-react';
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
  IconButton,
  Label,
  MonthYearPicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
  cn,
} from '@bhubai/bhub-design-system';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { COMPETENCIA_ATUAL } from '@/mocks/seed';
import { parseCompetencia } from '@/lib/competencia';

const TIPOS_DOCUMENTO = [
  { value: 'extratos', label: 'Extratos bancários' },
  { value: 'notas-emitidas', label: 'Notas fiscais emitidas' },
  { value: 'notas-recebidas', label: 'Notas fiscais recebidas' },
  { value: 'comprovantes', label: 'Comprovantes de pagamento' },
  { value: 'folha', label: 'Documentos de folha / pessoal' },
  { value: 'outros', label: 'Outros documentos' },
] as const;

interface FormValues {
  tipoDocumento: string;
  competencia: Date | undefined;
  contexto: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EnvioForaDoPrazo() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      tipoDocumento: '',
      competencia: parseCompetencia(COMPETENCIA_ATUAL),
      contexto: '',
    },
  });

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setFiles((current) => {
      const existing = new Set(current.map((f) => `${f.name}-${f.size}`));
      const novos = Array.from(incoming).filter(
        (f) => !existing.has(`${f.name}-${f.size}`)
      );
      return [...current, ...novos];
    });
    setFilesError(null);
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    if (files.length === 0) {
      setFilesError('Anexe ao menos um documento para enviar.');
      return;
    }

    // Protótipo: sem persistência. Simula o envio para a contabilidade.
    await new Promise((resolve) => setTimeout(resolve, 600));

    const competenciaLabel = values.competencia
      ? format(values.competencia, "MMMM 'de' yyyy", { locale: ptBR })
      : '';

    toast.success('Documentos enviados para a contabilidade', {
      description: `${files.length} arquivo(s) referente(s) a ${competenciaLabel}.`,
    });
    navigate('/');
  };

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para as tarefas
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-8 text-foreground">
            Envio de documento fora do prazo
          </h1>
          <p className="text-base leading-6 text-muted-foreground">
            Envie documentos de competências anteriores diretamente para a contabilidade.
          </p>
        </div>
      </div>

      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle>Quando usar este envio</AlertTitle>
        <AlertDescription>
          <span>
            Use este canal quando o prazo da tarefa já encerrou ou quando o documento
            se refere a um mês que não está mais aberto no calendário. A equipe da BHub
            recebe os arquivos, identifica a competência informada e dá o tratamento
            contábil necessário.
          </span>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>
              Anexe os arquivos que deseja enviar para a contabilidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isDragging
                  ? 'border-primary bg-accent'
                  : 'border-input hover:border-primary/60 hover:bg-accent/50'
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UploadCloud className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground">
                Arraste arquivos ou clique para selecionar
              </span>
              <span className="text-xs text-muted-foreground">
                PDF, imagens, planilhas ou XML — até 10 MB por arquivo
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />

            {filesError ? (
              <p className="text-sm text-destructive">{filesError}</p>
            ) : null}

            {files.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remover ${file.name}`}
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contexto do envio</CardTitle>
            <CardDescription>
              Essas informações ajudam a contabilidade a classificar os documentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="competencia">Mês/ano de competência</Label>
              <Controller
                control={control}
                name="competencia"
                rules={{ required: 'Selecione a competência do documento.' }}
                render={({ field }) => (
                  <MonthYearPicker
                    value={field.value}
                    onValueChange={field.onChange}
                    max={new Date()}
                    className="w-full"
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Mês a que os documentos se referem.
              </p>
              {errors.competencia ? (
                <p className="text-sm text-destructive">{errors.competencia.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tipoDocumento">Tipo de documento</Label>
              <Controller
                control={control}
                name="tipoDocumento"
                rules={{ required: 'Selecione o tipo de documento.' }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tipoDocumento" className="w-full">
                      <SelectValue placeholder="Selecione o tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_DOCUMENTO.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tipoDocumento ? (
                <p className="text-sm text-destructive">
                  {errors.tipoDocumento.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contexto">Observações (opcional)</Label>
              <Textarea
                id="contexto"
                rows={4}
                placeholder="Descreva o que está enviando e qualquer contexto que ajude a contabilidade (ex.: período exato, banco de origem, motivo do atraso)."
                {...register('contexto')}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <UploadCloud className="h-4 w-4" />
            {isSubmitting ? 'Enviando…' : 'Enviar para a contabilidade'}
          </Button>
        </div>
      </form>
    </div>
  );
}
