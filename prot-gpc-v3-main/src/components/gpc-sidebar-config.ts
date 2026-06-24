import type { NavGroup, UpdateCardProps } from '@bhubai/bhub-design-system';
import {
  BuildingIcon,
  CircleHelpIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  SendIcon,
} from '@bhubai/bhub-design-system/icons';
import { COMPETENCIA_ATUAL, HOJE_SIMULADO } from '@/mocks/seed';
import { contarTarefasAbertas } from '@/lib/tarefas-abertas';

/**
 * Monta os grupos de navegação da sidebar com o item ativo derivado da rota
 * atual (`pathname`). A sidebar do DS marca a seleção pelo flag `isActive` —
 * antes fixo no "Tarefas"; agora calculado por rota para que "Página inicial"
 * (/inicio) e "Tarefas" (/, /tarefas/:id) destaquem corretamente.
 *
 * Itens ainda sem tela no protótipo seguem `disabled` (tooltip "Indisponível
 * neste protótipo").
 */
export function buildGpcNavGroups(pathname: string): NavGroup[] {
  const inicioAtivo = pathname === '/inicio';
  const tarefasAtivo = pathname === '/' || pathname.startsWith('/tarefas');
  // Itens em aberto do mês vigente (fixo no protótipo): entradas não concluídas
  // + entregáveis aguardando ação. Em 02/2026 = 5.
  const tarefasAbertas = contarTarefasAbertas(COMPETENCIA_ATUAL, HOJE_SIMULADO);

  return [
    {
      label: 'Plataforma',
      items: [
        {
          title: 'Página inicial',
          icon: HomeIcon,
          href: '/inicio',
          isActive: inicioAtivo,
        },
        {
          title: 'Tarefas',
          icon: InboxIcon,
          href: '/',
          isActive: tarefasAtivo,
          ...(tarefasAbertas > 0 ? { badge: tarefasAbertas } : {}),
        },
        {
          title: 'Documentos e relatórios',
          icon: FolderIcon,
          href: '/documentos',
          disabled: true,
          hasNotification: true,
          notificationTooltip: 'Novos arquivos disponíveis',
        },
        {
          title: 'Solicitações',
          icon: SendIcon,
          href: '/solicitacoes',
          disabled: true,
          items: [
            {
              title: 'Realizar nova solicitação',
              icon: SendIcon,
              href: '/solicitacoes/nova',
            },
            {
              title: 'Minhas solicitações',
              icon: SendIcon,
              href: '/solicitacoes/minhas',
            },
          ],
        },
      ],
    },
    {
      label: 'Gestão',
      items: [
        {
          title: 'Minha empresa',
          icon: BuildingIcon,
          href: '/empresa',
          disabled: true,
          items: [
            {
              title: 'Gestão de acessos',
              icon: BuildingIcon,
              href: '/empresa/acessos',
            },
            {
              title: 'Contas financeiras',
              icon: BuildingIcon,
              href: '/empresa/contas',
            },
            {
              title: 'Cobranças BHub',
              icon: BuildingIcon,
              href: '/empresa/cobrancas',
            },
          ],
        },
        {
          title: 'Central de Ajuda',
          icon: CircleHelpIcon,
          href: '/ajuda',
          disabled: true,
        },
      ],
    },
  ];
}

export const gpcUpdateCard: UpdateCardProps = {
  title: 'Módulo tarefas reformulado',
  description: 'Novas melhorias para agilizar ainda mais suas obrigações com a BHub',
  href: '/',
};

export const gpcDisabledNavTooltip = 'Indisponível neste protótipo';
