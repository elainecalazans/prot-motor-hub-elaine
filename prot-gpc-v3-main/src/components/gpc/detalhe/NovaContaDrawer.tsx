import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bhubai/bhub-design-system';
import type { ContaFinanceira } from '@/types/gpc';
import { BancoCombobox, BANCO_OUTRO, nomeBanco } from './BancoCombobox';

/** Tipos de conta suportados (alinhados ao plano de contas da operação). */
const TIPOS_CONTA = [
  'Adiantamento',
  'Administradora de Cartões',
  'Caixinha',
  'Carteira Virtual',
  'Cartão de Crédito',
  'Conta Aplicação',
  'Conta Corrente',
  'Conta Empréstimo',
  'Conta Poupança',
  'Conta de Pagamento',
  'Crediário / Carnê',
  'Mútuo',
];

let counter = 0;
const novoId = () => `conta-${Date.now()}-${counter++}`;

interface Props {
  onCreate: (conta: ContaFinanceira) => void;
}

/**
 * Drawer (lateral direita) para cadastrar uma nova conta bancária da empresa.
 * Sem persistência (protótipo): ao salvar, a conta é devolvida via `onCreate`
 * e passa a ficar disponível na seleção de contas da tarefa de extratos.
 */
export function NovaContaDrawer({ onCreate }: Props) {
  const [open, setOpen] = useState(false);

  const [tipo, setTipo] = useState('');
  const [bancoCodigo, setBancoCodigo] = useState('');
  const [bancoOutro, setBancoOutro] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [contaDigito, setContaDigito] = useState('');

  const bancoFinal =
    bancoCodigo === BANCO_OUTRO ? bancoOutro.trim() : nomeBanco(bancoCodigo);

  const valido =
    tipo.length > 0 &&
    bancoFinal.length > 0 &&
    agencia.trim().length > 0 &&
    conta.trim().length > 0 &&
    contaDigito.trim().length > 0;

  const limpar = () => {
    setTipo('');
    setBancoCodigo('');
    setBancoOutro('');
    setAgencia('');
    setConta('');
    setContaDigito('');
  };

  const salvar = () => {
    if (!valido) return;
    const ultimos4 = conta.replace(/\D/g, '').slice(-4);
    onCreate({
      id: novoId(),
      banco: bancoFinal,
      tipo,
      identificacao: ultimos4 ? `•••• ${ultimos4}` : '',
    });
    toast.success('Conta cadastrada');
    limpar();
    setOpen(false);
  };

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) limpar();
      }}
    >
      <DrawerTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Plus className="h-4 w-4" />
          Cadastrar nova conta
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Cadastrar conta</DrawerTitle>
          <DrawerDescription>
            Informe os dados da conta da empresa para enviar os extratos.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tipo-conta">Tipo de conta</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="tipo-conta" className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_CONTA.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="banco">Banco</Label>
            <BancoCombobox id="banco" value={bancoCodigo} onChange={setBancoCodigo} />
          </div>

          {bancoCodigo === BANCO_OUTRO ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="banco-outro">Nome do banco</Label>
              <Input
                id="banco-outro"
                value={bancoOutro}
                onChange={(e) => setBancoOutro(e.target.value)}
                placeholder="Digite o nome da instituição"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="agencia">Agência</Label>
            <Input
              id="agencia"
              inputMode="numeric"
              value={agencia}
              onChange={(e) => setAgencia(e.target.value)}
              placeholder="0000"
            />
          </div>

          <div className="grid grid-cols-[1fr_88px] gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="conta">Número da conta</Label>
              <Input
                id="conta"
                inputMode="numeric"
                value={conta}
                onChange={(e) => setConta(e.target.value)}
                placeholder="00000000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="conta-digito">Dígito</Label>
              <Input
                id="conta-digito"
                inputMode="numeric"
                value={contaDigito}
                onChange={(e) => setContaDigito(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <DrawerFooter>
          <Button type="button" disabled={!valido} onClick={salvar}>
            Salvar conta
          </Button>
          <DrawerClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
