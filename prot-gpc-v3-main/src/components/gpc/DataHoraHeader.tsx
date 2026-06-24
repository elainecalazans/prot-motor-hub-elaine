import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HOJE_SIMULADO } from '@/mocks/seed';

/**
 * Indicador de data/hora do header, para o usuário se situar no tempo.
 *
 * A DATA é a do "hoje simulado" do protótipo (16/02/2026, fonte única em
 * HOJE_SIMULADO) — coerente com o calendário e a derivação de status. A HORA
 * acompanha o relógio real, para o indicador parecer vivo, e atualiza a cada
 * minuto.
 */
export function DataHoraHeader() {
  const [agora, setAgora] = useState(comHoraReal);

  useEffect(() => {
    const id = setInterval(() => setAgora(comHoraReal()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
      {format(agora, "d 'de' MMMM 'de' yyyy", { locale: ptBR })} · {format(agora, 'HH:mm')}
    </span>
  );
}

/** Combina a data simulada (HOJE_SIMULADO) com a hora do relógio real. */
function comHoraReal(): Date {
  const real = new Date();
  const d = new Date(HOJE_SIMULADO);
  d.setHours(real.getHours(), real.getMinutes(), real.getSeconds(), 0);
  return d;
}
