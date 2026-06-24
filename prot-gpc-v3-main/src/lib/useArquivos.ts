import { useCallback, useState } from 'react';
import type { ArquivoItem } from '@/components/gpc/ArquivoList';

let counter = 0;
const nextId = () => `arq-${Date.now()}-${counter++}`;

/**
 * Gerencia uma lista de arquivos em memória (protótipo, sem persistência).
 * Aceita uma lista inicial (ex.: arquivos já enviados vindos do seed).
 */
export function useArquivos(inicial: ArquivoItem[] = []) {
  const [arquivos, setArquivos] = useState<ArquivoItem[]>(inicial);

  const add = useCallback((incoming: FileList) => {
    const novos: ArquivoItem[] = Array.from(incoming).map((file) => ({
      id: nextId(),
      nome: file.name,
      tamanho: file.size,
    }));
    setArquivos((current) => [...current, ...novos]);
    return novos.length;
  }, []);

  const remove = useCallback((id: string) => {
    setArquivos((current) => current.filter((a) => a.id !== id));
  }, []);

  return { arquivos, add, remove };
}
