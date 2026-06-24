# @bhubai/bhub-design-system (vendor)

Cópia local pré-buildada do design system, vendorada para permitir o deploy do protótipo (Vercel) sem depender do GitHub Packages do BHubAI (que exige `NPM_AUTH_TOKEN` indisponível em forks).

## Base do snapshot

> **Base = `main` (última versão do DS).** O vendor é buildado a partir da `main`, que já traz `MonthYearPicker`, o `Alert` com variantes `success`/`warning`/`info` e os tokens semânticos atualizados (inclusive `--info-*`).
>
> **Overlay temporário = sidebar v2.** A única coisa que ainda não está na `main` é a **sidebar** que o protótipo usa (`AppSidebar`, `NotificationBell`, `DropdownMenu`, `Collapsible` e os blocos em `components/sidebar/*`). Esses arquivos vivem na branch `feat/sidebar-v2` e ainda **não foram mergiados**. Enquanto isso não acontece, fazemos overlay desses arquivos sobre a `main` no momento do build. Quando a sidebar for mergiada na `main`, este overlay deixa de ser necessário — basta buildar a `main` pura.

## Como atualizar

```bash
cd ../bsystem

# 1) Base: main (última versão)
git checkout -b tmp/vendor-gpc main

# 2) Overlay: traz apenas os arquivos da sidebar ainda não mergiados
git checkout feat/sidebar-v2 -- \
  components/ui/app-sidebar.tsx \
  components/ui/collapsible.tsx \
  components/ui/dropdown-menu.tsx \
  components/sidebar/current-datetime.tsx \
  components/sidebar/datetime-config.ts \
  components/sidebar/nav-config.ts \
  components/sidebar/nav-main.tsx \
  components/sidebar/nav-secondary.tsx \
  components/sidebar/nav-user.tsx \
  components/sidebar/notification-bell.tsx \
  components/sidebar/notification-config.ts \
  components/sidebar/notification-dot.tsx \
  components/sidebar/sidebar-logo.tsx \
  components/sidebar/update-card.tsx \
  components/sidebar/workspace-switcher.tsx

# 3) Adicione os exports da sidebar em src/index.ts:
#    app-sidebar, collapsible, dropdown-menu e os blocos sidebar/* (nav-config,
#    nav-main, update-card, current-datetime, datetime-config, notification-bell,
#    notification-config, notification-dot). Veja o bloco "Sidebar building blocks".

# 4) Build
npm run build

# De volta no prot-gpc-v3:
rm -rf vendor/bhub-design-system/dist
cp -R ../bsystem/dist vendor/bhub-design-system/dist
```

Se as `dependencies` do bsystem mudarem, replique a alteração no `vendor/bhub-design-system/package.json` e rode `npm install`.
