import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AppSidebar,
  NotificationBell,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@bhubai/bhub-design-system';
import {
  buildGpcNavGroups,
  gpcDisabledNavTooltip,
  gpcUpdateCard,
} from '@/components/gpc-sidebar-config';
import { DataHoraHeader } from '@/components/gpc/DataHoraHeader';
import { notificacoesMotor } from '@/mocks/notificacoes-motor';
import { FlowBanner } from '@/components/FlowBanner';
import { FLOW_META } from '@/lib/flow-meta';

/** Título da topbar por rota. */
function headerTitle(pathname: string): string {
  if (pathname === '/inicio') return 'Início';
  if (pathname === '/' || pathname.startsWith('/tarefas') || pathname.startsWith('/envio-fora-do-prazo'))
    return 'Tarefas';
  return 'GPC — Gestor de Pendência do Cliente';
}

export function Layout() {
  const [notifications, setNotifications] = useState(notificacoesMotor);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const navGroups = useMemo(() => buildGpcNavGroups(pathname), [pathname]);

  // Lê o parâmetro ?flow= para exibir o banner contextual do hub-index.
  const flowMeta = useMemo(() => {
    const key = searchParams.get('flow');
    return key ? (FLOW_META[key] ?? null) : null;
  }, [searchParams]);

  // O AppSidebar do DS renderiza cada item como <button> e NÃO faz navegação
  // própria (não expõe href de link nem callback onNavigate). Delegamos o clique
  // aqui: identificamos o item habilitado pelo texto do botão e navegamos via
  // React Router (SPA, preservando o estado em memória do protótipo).
  const alvosNav = useMemo(() => {
    const list: { title: string; href: string }[] = [];
    for (const grupo of navGroups) {
      for (const item of grupo.items) {
        if (!item.disabled && item.href?.startsWith('/')) {
          list.push({ title: item.title, href: item.href });
        }
      }
    }
    return list;
  }, [navGroups]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const alvo = e.target as HTMLElement | null;
      const botao = alvo?.closest('[data-sidebar="menu-button"]');
      if (!botao) return;
      const texto = (botao.textContent || '').trim();
      const item = alvosNav.find((a) => texto.startsWith(a.title));
      if (item && item.href !== pathname) navigate(item.href);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [alvosNav, navigate, pathname]);

  return (
    <SidebarProvider>
      <AppSidebar
        navGroups={navGroups}
        updateCard={gpcUpdateCard}
        disabledTooltip={gpcDisabledNavTooltip}
      />
      <SidebarInset>
        {/* shrink-0: o inset é um flex column que rola por dentro (h-svh); sem
            isto o header h-14 é comprimido pelo flexbox quando o conteúdo gera
            scroll e "afina". Travamos a altura para mantê-la igual com e sem scroll. */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">{headerTitle(pathname)}</span>
          <div className="ml-auto flex items-center gap-3">
            <DataHoraHeader />
            <span className="h-5 w-px bg-border" aria-hidden />
            <NotificationBell
              notifications={notifications}
              onNotificationClick={(notification) =>
                setNotifications((current) =>
                  current.map((item) =>
                    item.id === notification.id ? { ...item, read: true } : item
                  )
                )
              }
              onMarkAllRead={() =>
                setNotifications((current) => current.map((item) => ({ ...item, read: true })))
              }
            />
          </div>
        </header>
        <main className="flex-1 px-12 pt-14 pb-12">
          {flowMeta && <FlowBanner meta={flowMeta} />}
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}