# prot-gpc-v3

Protótipo do **GPC (Gestor de Pendências do Cliente)** dentro do **Hub do Empreendedor** da BHub.

O GPC é o módulo onde o cliente do escritório acompanha todas as obrigações mensais necessárias para regularizar a contabilidade da empresa. Este repositório é um protótipo navegável para validação de UX/UI e handoff para engenharia — toda a camada de dados é mockada via MSW.

> **Importante:** é protótipo. Sem API real, sem autenticação, sem persistência além de localStorage. Veja `CLAUDE.md` para o contexto completo do produto.

## Stack

- **Vite 8 + React 19 + TypeScript** (strict)
- **Tailwind CSS 4** (tokens via `@theme` em `index.css`)
- **[@bhubai/bhub-design-system](https://github.com/BHubAI/bhub-design-system)** — design system oficial BHub (shadcn/ui + Radix)
- **TanStack Query** — estado de servidor (cache, invalidations)
- **React Hook Form** — formulários
- **React Router v6** — roteamento
- **MSW 2.x** — mock de API rodando no browser via Service Worker
- **sonner** — toasts
- **date-fns** + **lucide-react**

## Como rodar

O pacote `@bhubai/bhub-design-system` vem do **GitHub Packages** (privado). Antes do `npm install` é preciso autenticar via `gh`:

```bash
# Token com escopo read:packages
gh auth refresh -h github.com -s read:packages
export NPM_AUTH_TOKEN=$(gh auth token)

npm install
npm run dev          # http://localhost:5173
npm run build        # tsc + vite build
npm run typecheck    # tsc --noEmit
npm run msw:init     # regenera public/mockServiceWorker.js (raramente necessário)
```

### BSystem em link local (provisório)

Enquanto a `AppSidebar` (sidebar v2) não for publicada como release oficial do BSystem, o `package.json` aponta para uma cópia local do repositório, via:

```json
"@bhubai/bhub-design-system": "file:../bsystem"
```

Pré-requisitos para esse setup:

1. Clonar `BHubAI/bhub-design-system` em `../bsystem` (no mesmo nível do `prot-gpc-v3`).
2. Estar na branch `feat/sidebar-v2`.
3. Rodar `npm install && npm run build` dentro do `bsystem`.
4. Voltar para o `prot-gpc-v3` e rodar `npm install`.

A cada mudança no BSystem local, rode `npm run build` dentro dele — a próxima carga do Vite já pega a versão nova (sem HMR, mas reload manual instantâneo).

Quando a sidebar v2 for publicada, trocar o `file:../bsystem` pela versão fixada do pacote.

## Estrutura

```
src/
├── main.tsx                 # bootstrap: MSW (dev) + QueryClient + Router + Toaster
├── App.tsx                  # rotas
├── index.css                # Tailwind + BSystem styles + tokens base
├── api/client.ts            # fetch wrapper com ApiError
├── components/
│   └── Layout.tsx           # shell com AppSidebar + header com NotificationBell
├── mocks/
│   ├── browser.ts           # setupWorker do MSW
│   └── handlers.ts          # endpoints HTTP mockados (vazio por ora)
└── pages/
    └── Home.tsx             # placeholder
```

Alias `@/` → `src/`.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Sobe Vite em http://localhost:5173 |
| `npm run build` | `tsc` + `vite build` |
| `npm run typecheck` | Apenas `tsc --noEmit` |
| `npm run preview` | Preview do build de produção |
| `npm run msw:init` | Regenera `public/mockServiceWorker.js` |

## Convenções

- **PT-BR no domínio:** identificadores de negócio em português (`Tarefa`, `competencia`, `guia`). Identificadores genéricos em inglês quando óbvio.
- **`@bhubai/bhub-design-system` é a primeira opção** — não recriar Button/Input/Card localmente. Se faltar componente, criar em `src/components/` e marcar com TODO.
- **Sem testes / sem lint configurados.** `npm run typecheck` é o smoke test do protótipo.
- **Datas:** API usa ISO; formulários usam `Date`; display via `date-fns` com locale `ptBR`.

Mais detalhes sobre o produto, modelo de domínio e fluxos em [`CLAUDE.md`](./CLAUDE.md).
