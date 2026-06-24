import type { Notification } from '@bhubai/bhub-design-system';

/**
 * Notificações do Motor Contábil para demonstração no NotificationBell.
 *
 * Cobre os 7 tipos definidos na HUB-238 em linguagem de negócio para o
 * cliente — sem terminologia interna do Motor.
 *
 * Ordenadas da mais recente para a mais antiga (como chegaria de uma API).
 * Não lidas: as 3 primeiras, refletindo o estado ativo da competência atual.
 */
export const notificacoesMotor: Notification[] = [
  // 1. Renovar autorização Open Finance — token expirado (ação urgente)
  {
    id: 'notif-token-expirado',
    title: 'Conexão com Bradesco expirou',
    description:
      'Sua autorização de acesso à conta Bradesco via Open Finance precisa ser renovada para continuar recebendo extratos automaticamente.',
    time: 'Agora',
    read: false,
  },

  // 2. Extrato pendente — urgente (6º dia útil sem extrato)
  {
    id: 'notif-extrato-urgente',
    title: 'Prazo se aproximando — extrato Inter',
    description:
      'Falta 1 dia útil para o prazo de envio do extrato da conta Inter de janeiro. Envie agora para não atrasar seu fechamento contábil.',
    time: 'Hoje',
    read: false,
  },

  // 3. Extrato pendente — lembrete (3º dia útil sem extrato)
  {
    id: 'notif-extrato-lembrete',
    title: 'Lembrete — extrato Santander',
    description:
      'O extrato da conta Santander de janeiro ainda não foi recebido. Envie até 19/02 para darmos continuidade ao seu fechamento contábil.',
    time: 'Hoje',
    read: false,
  },

  // 4. Movimentação não identificada — suspense (cliente no loop)
  {
    id: 'notif-movimentacao-suspense',
    title: 'Precisamos da sua ajuda',
    description:
      'Há 2 movimentações de janeiro que não conseguimos identificar automaticamente. Sua resposta ajuda a completar o fechamento.',
    time: 'Ontem',
    read: true,
  },

  // 5. Lançamentos para confirmar — baixa confiança (0,75–0,90)
  {
    id: 'notif-lancamentos-confirmar',
    title: 'Lançamentos aguardando sua confirmação',
    description:
      '3 lançamentos de janeiro foram classificados automaticamente com confiança média. Confirme até 20/02 para não atrasar o fechamento.',
    time: '2 dias atrás',
    read: true,
  },

  // 6. Fechamento via caixa realizado — informativo com aviso
  {
    id: 'notif-fechamento-via-caixa',
    title: 'Fechamento de dezembro realizado via comprovantes',
    description:
      'O fechamento contábil de dezembro foi concluído com base nos comprovantes de pagamento de tributos. O extrato bancário não foi recebido nesta competência.',
    time: '15 jan',
    read: true,
  },

  // 7. Fechamento concluído — positivo
  {
    id: 'notif-fechamento-concluido',
    title: 'Fechamento de novembro concluído',
    description:
      'Seu fechamento contábil de novembro foi concluído com sucesso. Relatórios e comprovantes estão disponíveis em Documentos.',
    time: '12 dez',
    read: true,
  },
];
