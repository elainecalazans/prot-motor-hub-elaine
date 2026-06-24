import { useCallback, useSyncExternalStore } from 'react';
import type { RegistroDownload } from '@/types/gpc';

export const USUARIO_GUIA_ATUAL = { usuario: 'Arthur Moreira', iniciais: 'AM' };

const pagas = new Set<string>();
const marcacoesPorGuia = new Map<string, RegistroDownload[]>();
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

export function useGuiasPagas() {
  useSyncExternalStore(subscribe, () => snapshot);

  const isPaga = useCallback((id: string) => pagas.has(id), []);

  const marcarComoPaga = useCallback((guiaId: string) => {
    if (pagas.has(guiaId)) return null;

    pagas.add(guiaId);
    const registro: RegistroDownload = {
      id: `pago-${Date.now()}`,
      tipo: 'marcado-como-pago',
      usuario: USUARIO_GUIA_ATUAL.usuario,
      iniciais: USUARIO_GUIA_ATUAL.iniciais,
      baixadoEm: new Date().toISOString(),
    };
    marcacoesPorGuia.set(guiaId, [registro, ...(marcacoesPorGuia.get(guiaId) ?? [])]);
    bump();
    return registro;
  }, []);

  const getMarcacoes = useCallback((guiaId: string) => marcacoesPorGuia.get(guiaId) ?? [], []);

  return { isPaga, marcarComoPaga, getMarcacoes };
}
