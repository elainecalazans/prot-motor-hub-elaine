import { useCallback, useRef, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from '@bhubai/bhub-design-system';
import { BANCOS } from '@/data/bancos';

/** Valor sentinela para "banco não listado". */
export const BANCO_OUTRO = '__outro__';

/**
 * Bancos mais usados, fixados no topo da lista com nome comercial amigável.
 * A ordem reflete a prioridade de exibição (não alfabética).
 */
const PRINCIPAIS = [
  { codigo: '001', nome: 'Banco do Brasil' },
  { codigo: '104', nome: 'Caixa Econômica Federal' },
  { codigo: '237', nome: 'Bradesco' },
  { codigo: '341', nome: 'Itaú Unibanco' },
  { codigo: '033', nome: 'Santander' },
  { codigo: '260', nome: 'Nubank' },
  { codigo: '077', nome: 'Banco Inter' },
  { codigo: '336', nome: 'C6 Bank' },
  { codigo: '212', nome: 'Banco Original' },
  { codigo: '748', nome: 'Sicredi' },
  { codigo: '756', nome: 'Sicoob' },
  { codigo: '422', nome: 'Banco Safra' },
  { codigo: '290', nome: 'PagBank' },
  { codigo: '323', nome: 'Mercado Pago' },
  { codigo: '380', nome: 'PicPay' },
];

const PRINCIPAIS_CODIGOS = new Set(PRINCIPAIS.map((b) => b.codigo));
const OUTROS_BANCOS = BANCOS.filter((b) => !PRINCIPAIS_CODIGOS.has(b.codigo));

/** Rótulo "código - nome" de um banco conhecido (ou '' se não encontrado). */
export function nomeBanco(codigo: string): string {
  const banco =
    PRINCIPAIS.find((b) => b.codigo === codigo) ??
    BANCOS.find((b) => b.codigo === codigo);
  return banco ? `${banco.codigo} - ${banco.nome}` : '';
}

interface Props {
  /** Código do banco selecionado, BANCO_OUTRO, ou '' (nenhum). */
  value: string;
  onChange: (codigo: string) => void;
  id?: string;
}

/**
 * Combobox com busca para selecionar o banco. Os principais ficam fixados no
 * topo; abaixo, a lista completa (códigos COMPE do Bacen). Permite buscar por
 * nome ou código e oferece a opção "Outro (não listado)".
 */
export function BancoCombobox({ value, onChange, id }: Props) {
  const [open, setOpen] = useState(false);
  const limparWheel = useRef<(() => void) | null>(null);

  const rotulo =
    value === BANCO_OUTRO ? 'Outro (não listado)' : nomeBanco(value);

  const selecionar = (codigo: string) => {
    onChange(codigo);
    setOpen(false);
  };

  // Dentro do Drawer (vaul), o react-remove-scroll trava o scroll nativo deste
  // popover (portado para fora do #root) com preventDefault no wheel — e o
  // onWheel do React não alcança nós portados. Via callback ref, anexamos um
  // listener nativo (captura) no conteúdo assim que ele monta e rolamos a lista
  // manualmente, contornando o bloqueio.
  const setConteudoRef = useCallback((node: HTMLDivElement | null) => {
    limparWheel.current?.();
    limparWheel.current = null;
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      const lista = node.querySelector<HTMLElement>('[data-slot="command-list"]');
      if (!lista) return;
      lista.scrollTop += e.deltaY;
      e.preventDefault();
    };
    node.addEventListener('wheel', onWheel, { passive: false, capture: true });
    limparWheel.current = () =>
      node.removeEventListener('wheel', onWheel, { capture: true });
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !rotulo && 'text-muted-foreground'
          )}
        >
          {rotulo || 'Selecione o banco'}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <div ref={setConteudoRef}>
          <Command>
            <CommandInput placeholder="Buscar por nome ou código…" />
            <CommandList>
            <CommandEmpty>Nenhum banco encontrado.</CommandEmpty>
            <CommandGroup heading="Principais">
              {PRINCIPAIS.map((b) => (
                <CommandItem
                  key={b.codigo}
                  value={`${b.codigo} ${b.nome}`}
                  onSelect={() => selecionar(b.codigo)}
                >
                  <Check
                    className={cn(
                      'h-4 w-4',
                      value === b.codigo ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {b.codigo} - {b.nome}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Todos os bancos">
              {OUTROS_BANCOS.map((b) => (
                <CommandItem
                  key={b.codigo}
                  value={`${b.codigo} ${b.nome}`}
                  onSelect={() => selecionar(b.codigo)}
                >
                  <Check
                    className={cn(
                      'h-4 w-4',
                      value === b.codigo ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {b.codigo} - {b.nome}
                </CommandItem>
              ))}
              <CommandItem
                value="outro banco não listado"
                onSelect={() => selecionar(BANCO_OUTRO)}
              >
                <Check
                  className={cn(
                    'h-4 w-4',
                    value === BANCO_OUTRO ? 'opacity-100' : 'opacity-0'
                  )}
                />
                Outro (não listado)
              </CommandItem>
            </CommandGroup>
          </CommandList>
          </Command>
        </div>
      </PopoverContent>
    </Popover>
  );
}
