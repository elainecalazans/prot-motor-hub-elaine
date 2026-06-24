import { useCallback, useSyncExternalStore } from 'react';

/**
 * Estado mockado (em memória, sem persistência) de quais contas financeiras
 * estão automatizadas via Open Finance. Mesmo padrão de `useGuiasPagas`:
 * singleton no escopo do módulo + `useSyncExternalStore`, compartilhado entre
 * todos os componentes (badge da tarefa e modal de configuração).
 *
 * Nada começa automatizado — todas as contas iniciam exigindo envio manual; o
 * cliente automatiza/remove pelo modal de Open Finance.
 *
 * Contas com `tokenExpirado: true` no seed são tratadas como automatizadas mas
 * com autorização vencida — ficam no Set `expiradas` e saem de `automatizadas`.
 */
const automatizadas = new Set<string>();
const expiradas = new Set<string>();
const listeners = new Set<() => void>();
let snapshot = 0;

function bump() {
  snapshot++;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useContasAutomatizadas() {
  useSyncExternalStore(subscribe, () => snapshot);

  const isAutomatizada = useCallback((id: string) => automatizadas.has(id), []);
  const isExpirada = useCallback((id: string) => expiradas.has(id), []);

  const automatizar = useCallback((id: string) => {
    if (automatizadas.has(id)) return;
    automatizadas.add(id);
    expiradas.delete(id);
    bump();
  }, []);

  const remover = useCallback((id: string) => {
    if (!automatizadas.delete(id)) return;
    bump();
  }, []);

  /**
   * Marca uma conta como tendo token expirado (estava automatizada, perdeu
   * autorização). Remove de `automatizadas` e coloca em `expiradas`.
   */
  const marcarExpirada = useCallback((id: string) => {
    automatizadas.delete(id);
    expiradas.add(id);
    bump();
  }, []);

  /**
   * Renova o token de uma conta expirada — ela volta para `automatizadas`.
   */
  const renovarToken = useCallback((id: string) => {
    expiradas.delete(id);
    automatizadas.add(id);
    bump();
  }, []);

  return {
    isAutomatizada,
    isExpirada,
    automatizar,
    remover,
    marcarExpirada,
    renovarToken,
    /** Total de contas automatizadas — alimenta o badge da tarefa e o tooltip. */
    quantidade: automatizadas.size,
    /** IDs das contas com token expirado — alimenta alertas na ExtratosBody. */
    idsExpiradas: Array.from(expiradas),
  };
}
