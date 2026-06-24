import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  cn,
} from '@bhubai/bhub-design-system';
import type { ArquivoItem } from '@/components/gpc/ArquivoList';
import { ArquivoList } from '@/components/gpc/ArquivoList';
import { FileDropzone } from '@/components/gpc/FileDropzone';
import { useArquivos } from '@/lib/useArquivos';

const POR_PAGINA = 10;

interface Props {
  /** Texto do card de upload. */
  uploadTitulo: string;
  uploadDescricao: string;
  /** Texto do card da lista. */
  listaTitulo: string;
  listaVazia: string;
  /** Arquivos já enviados (seed). */
  iniciais?: ArquivoItem[];
  /** Conteúdo de orientação exibido no card de upload, acima da dropzone. */
  orientacao?: React.ReactNode;
}

/**
 * Corpo genérico de upload com gerenciamento de lista (notas fiscais e
 * documentos para fechamento). O cliente envia arquivos e vê/gerencia o que
 * já enviou. A lista de enviados pagina de 10 em 10.
 */
export function UploadComumBody({
  uploadTitulo,
  uploadDescricao,
  listaTitulo,
  listaVazia,
  iniciais = [],
  orientacao,
}: Props) {
  const { arquivos, add, remove } = useArquivos(iniciais);
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(arquivos.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const visiveis = arquivos.slice(inicio, inicio + POR_PAGINA);

  const irPara = (p: number) => setPagina(Math.min(Math.max(p, 1), totalPaginas));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{uploadTitulo}</CardTitle>
          <CardDescription>{uploadDescricao}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {orientacao}
          <FileDropzone
            onFiles={(files) => {
              const n = add(files);
              toast.success(
                n > 1 ? `${n} arquivos adicionados` : 'Arquivo adicionado'
              );
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{listaTitulo}</CardTitle>
          <CardDescription>
            {arquivos.length > 0
              ? `${arquivos.length} arquivo(s) enviado(s) para a contabilidade.`
              : listaVazia}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ArquivoList arquivos={visiveis} onRemove={remove} />

          {totalPaginas > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Mostrando {inicio + 1}–{inicio + visiveis.length} de {arquivos.length}
              </span>
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      aria-label="Ir para a página anterior"
                      size="default"
                      aria-disabled={paginaAtual === 1}
                      className={cn(
                        'gap-1 px-2.5',
                        paginaAtual === 1 && 'pointer-events-none opacity-50'
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        irPara(paginaAtual - 1);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Anterior</span>
                    </PaginationLink>
                  </PaginationItem>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === paginaAtual}
                        onClick={(e) => {
                          e.preventDefault();
                          irPara(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationLink
                      aria-label="Ir para a próxima página"
                      size="default"
                      aria-disabled={paginaAtual === totalPaginas}
                      className={cn(
                        'gap-1 px-2.5',
                        paginaAtual === totalPaginas && 'pointer-events-none opacity-50'
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        irPara(paginaAtual + 1);
                      }}
                    >
                      <span>Próxima</span>
                      <ChevronRight className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
