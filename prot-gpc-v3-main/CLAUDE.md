# CLAUDE.md

Guia de contexto para o Claude Code trabalhar com este projeto.

## O que é este projeto

Protótipo navegável do **GPC — Gestor de Pendências do Cliente**, um módulo do **Hub do Empreendedor** (portal do cliente da BHub). No GPC o cliente do escritório vê e executa todas as obrigações mensais necessárias para manter a contabilidade da empresa em dia.

> **Importante:** é protótipo de produto. Toda a API é mockada via MSW (Mock Service Worker), dados ficam em memória e somem ao recarregar. Sem autenticação real, sem persistência, sem integração com sistemas origem.

### Por que existe

Hoje as obrigações mensais do cliente se espalham por e-mail, planilhas e mensagens — sem visibilidade do que está pendente, o que está em prazo, e o que já foi entregue. O GPC concentra tudo isso em **um único calendário mensal**, mostrando:

1. O que o **cliente** precisa enviar pra BHub (tarefas de entrada).
2. O que a **BHub** precisa entregar pro cliente (tarefas de saída).
3. Datas, prazos, status e ações disponíveis em cada tarefa.

Este protótipo serve para:
1. Validar fluxos de UX e copy com clientes;
2. Alinhar regras de negócio (status, automação, recorrência) com produto e operação;
3. Servir de referência viva para o time de engenharia construir o módulo real.

### Quem usa

- **Cliente do escritório** (Admin/RH/Leitura de uma empresa contratante) — única persona com UI; executa as tarefas de entrada e consome as guias geradas.
- **Operador BHub** — não tem UI aqui; é o "outro lado" que produz as tarefas de saída e configura recorrência.

Usuário pré-autenticado no protótipo (vem dos defaults do `AppSidebar` do BSystem):
- **Arthur Moreira** (`arthur@bhub.com.br`) — Principal
- Empresa ativa: **Efferd** (CNPJ `12.345.678/0001-90`)
- Competência aberta: **02/2026**

---

## Stack

- **Vite 8 + React 19 + TypeScript** (strict)
- **Tailwind CSS 4** (tokens via `@theme` em `index.css`)
- **[@bhubai/bhub-design-system](https://github.com/BHubAI/bhub-design-system)** — design system oficial BHub. Consumido como **cópia vendorizada pré-buildada** em `vendor/bhub-design-system` (via `file:./vendor/...` no `package.json`). O build vem da **`main` (última versão)** do bsystem — que já traz `MonthYearPicker`, `Alert` com variantes `success`/`warning`/`info` e tokens atualizados — **mais um overlay temporário** dos componentes de sidebar (`AppSidebar`, `NotificationBell`, `DropdownMenu`, `Collapsible`, `components/sidebar/*`) que ainda vivem na branch `feat/sidebar-v2` e não foram mergiados. Receita completa em `vendor/bhub-design-system/README.md`.
- **TanStack Query** — estado de servidor (cache, invalidations)
- **React Hook Form** — formulários (sem schema lib; validações inline via `register`)
- **React Router v6** — roteamento
- **MSW 2.x** — mock de API rodando 100% no browser via Service Worker
- **sonner** — toasts
- **date-fns** + **lucide-react** + **clsx**

Veja `README.md` para o passo-a-passo do setup (autenticação no GitHub Packages, build local do BSystem, scripts).

---

## Mapa do código

```
src/
├── main.tsx                          # bootstrap: MSW (dev) + QueryClient + Router + Toaster
├── App.tsx                           # rotas (/inicio Página inicial + / Tarefas + /tarefas/:id + envio fora do prazo)
├── index.css                         # Tailwind + tokens BSystem + tokens locais (ex.: mizu-flow-bold)
├── api/client.ts                     # fetch wrapper com ApiError
├── types/
│   └── gpc.ts                        # Tarefa, TarefaEntrada, TarefaSaida, StatusTarefa, Competencia, etc.
├── lib/
│   ├── competencia.ts                # parse/format/navegação de competência (YYYY-MM)
│   ├── status.ts                     # deriveStatusEntrada(tarefa, hoje): regra dos 3 status
│   └── inicio.ts                     # getInicioVM(): view-model da Página inicial (selector puro; reusa status)
├── components/
│   ├── Layout.tsx                    # shell: AppSidebar + topbar + main (navGroups/título por rota via useLocation; clique do sidebar delegado p/ React Router)
│   ├── gpc-sidebar-config.ts         # buildGpcNavGroups(pathname): navegação da sidebar + item ativo por rota
│   └── gpc/
│       ├── inicio/                   # cards da Página inicial: ProximaAcaoCard, PendenciaCard, AcompanharCard, BannerEventual
│       ├── CompetenciaCalendar.tsx   # calendário com dots + seleção controlada + click-outside
│       ├── TarefaCard.tsx            # CardShell + TarefaEntradaCard + GuiaCard (com Calculando)
│       ├── SectionTable.tsx          # bloco cinza com título + ações + cards brancos
│       ├── TaskProgress.tsx          # "2/6 Tarefas concluídas" + barra verde
│       ├── StatusIcon.tsx            # chip 36×36 colorido por status (entradas; guias usam ícone de documento fixo)
│       ├── AutomacaoBadge.tsx        # badge de automação: "Automatizar" (CTA) / "Automático" (≥1 conta conectada); clicável → abre o modal; tooltip com contagem
│       ├── AutomacaoOpenFinanceModal.tsx # modal de config do Open Finance: "como funciona" + conectar/remover contas (mock)
│       ├── ContaAutomaticaBadge.tsx  # pílula magic "Automática" (conta conectada); reusada no modal e no detalhe de extrato
│       └── WarningAlert.tsx          # banner amarelo "Tarefas em constante evolução"
├── hooks/
│   ├── useGuiasPagas.ts              # store em memória: guias marcadas como pagas
│   └── useContasAutomatizadas.ts     # store em memória: contas conectadas via Open Finance (isAutomatizada/automatizar/remover/quantidade)
├── mocks/
│   ├── browser.ts                    # setupWorker
│   ├── handlers.ts                   # vazio (protótipo sem API, ver memória do projeto)
│   ├── seed.ts                       # tarefas de entrada/saída + folha + fechamento (02/2026 curado)
│   └── solicitacoes.ts               # MOCK ilustrativo de Solicitações (não navegável) usado na Página inicial
└── pages/
    ├── PaginaInicial.tsx             # /inicio: Página inicial do Hub (pendências + acompanhar + banners)
    ├── Home.tsx                      # / : dashboard de Tarefas (calendário + entradas + entregáveis)
    ├── TarefaDetalhe.tsx             # /tarefas/:id: interna de cada tarefa/entregável
    └── EnvioForaDoPrazo.tsx          # /envio-fora-do-prazo: upload de documentos retroativos
```

`@/` é alias para `src/` (vite + tsconfig).

---

## Modelo de domínio

### Categorias de tarefa

Toda tarefa do GPC pertence a uma de duas categorias:

| Categoria | Direção | O que é |
|---|---|---|
| **Tarefa de Entrada** | Cliente → BHub | Documentos/dados que o cliente envia pra contabilidade processar: extratos bancários, notas fiscais emitidas, comprovantes, etc. |
| **Tarefa de Saída** | BHub → Cliente | Entregáveis que a BHub disponibiliza pro cliente. Divide-se em dois sub-tipos: **(a) Guias de impostos** (Simples Nacional, Receitas Federais, etc.) e **(b) Cobranças BHub** (mensalidade do escritório). |

### Status das tarefas

Três estados visuais — para tarefas de entrada o status é **derivado em runtime** de **prazo + arquivos + hoje** por `deriveStatusEntrada` (`src/lib/status.ts`), e não fica fixo no seed. Não existe estado intermediário "em andamento": enviar arquivos dentro do prazo **conclui** a tarefa (a remoção do antigo status azul foi intencional, para reduzir ambiguidade). O "hoje" simulado é fonte única em `HOJE_SIMULADO` (`src/mocks/seed.ts`).

| Status | Ícone/cor | Significado |
|---|---|---|
| **Cinza** | relógio cinza | Tarefa **não iniciada** e ainda **dentro do prazo**. Default. |
| **Verde** | check em fundo verde | Tarefa **concluída**: arquivos enviados dentro do prazo OU cliente confirmou que **não tem envio** naquele mês. |
| **Vermelho** | relógio vermelho em fundo rosa | Prazo encerrado **sem** envio. Cliente ainda pode resolver: enviar arquivos OU confirmar que não tem envio (→ vira verde). |

> Estados auxiliares: tarefas de saída (guias) podem aparecer em **Calculando** (botão cinza com spinner) enquanto a BHub apura o valor — ainda sem data/valor definitivos.

> "Vermelho" não é estado terminal — é uma pendência cinza que estourou prazo. Ao agir, o cliente leva pra verde.

### Automação (Open Finance)

A tarefa de **Importar extratos bancários** (`tipo: 'extratos'`) é elegível à automação via **Open Finance**: o cliente conecta as contas e os extratos passam a chegar sozinhos, sem upload manual. **A automação é por conta, não por tarefa nem por mês** — uma conta da empresa, uma vez conectada, vale para todas as competências.

**Estado** — vive só em runtime, sem persistência, no store singleton `useContasAutomatizadas` (`src/hooks/useContasAutomatizadas.ts`, mesmo padrão de `useGuiasPagas`: `Set` de ids + `useSyncExternalStore`). Nada começa conectado. API: `isAutomatizada(id)`, `automatizar(id)`, `remover(id)`, `quantidade`.

**Badge da tarefa** (`AutomacaoBadge`, derivado do store):

| Badge | Estilo | Quando |
|---|---|---|
| **Automatizar** | outline tracejado roxo (`#9333ea`/`#faf5ff`) | tarefa elegível com **0 contas** conectadas. Hover próprio (não vem do Figma/DS). |
| **Automático** | sólido roxo (`#9333ea`) | **≥1 conta** conectada. Tooltip mostra a contagem ("N contas automatizadas"). |

Em **ambos** os estados o badge é clicável e abre o **modal de configuração** (`AutomacaoOpenFinanceModal`). `tarefa.automacao` no seed guarda só a *elegibilidade* (`elegivel`); a exibição (`elegivel`→`ativa`) é derivada de `quantidade > 0` no `TarefaEntradaCard`.

**Modal** (`AutomacaoOpenFinanceModal`, `Dialog` do DS) — tela intermediária educativa: (1) título + apoio; (2) **"Como funciona"**, stepper vertical numerado de 5 passos (inclui autorizar o parceiro **Pluggy** — CNPJ 37.943.755/0001-30); (3) **empty state** (botão primário "Conectar conta" centralizado) ou **lista das contas conectadas** (badge "Automática" + "Remover"). "Conectar conta" simula a conexão da próxima conta ainda não conectada (mock; o fluxo real de banco/login/redirect é placeholder). "Remover" abre um `AlertDialog` de confirmação (âmbar) avisando que a conta volta a exigir envio manual.

**Detalhe da tarefa** (`ExtratosBody`) — o mesmo store integra a interna do extrato: card **"Envio automático"** lista as contas conectadas e abre o modal ("Configurar"/"Gerenciar"); o card **"Enviar extrato manualmente"** lista no `Select` **só as contas não conectadas** (as automáticas saem). Conectar/remover reflete na hora no badge da Home e nos dois cards.

### Competência mensal

A unidade de navegação do GPC é o **mês de competência** (`YYYY-MM`). O cliente:

- Vê o calendário do mês atual por padrão (no protótipo, **02/2026**);
- Pode navegar para meses anteriores **em modo somente leitura** (sem editar/anexar pelo card normal);
- Para enviar documentos referentes a meses passados, usa o atalho **"Envio de documento fora do prazo"** — sempre visível no header da Home, independente da competência aberta.

### Guias

Subtipo de tarefa de saída. Características próprias:

- **Não têm status de conclusão** (não ficam verde/vermelho). O chip à esquerda é fixo: **ícone de documento em cinza** (`FileText`), só para diferenciar visualmente das tarefas de entrada;
- Botão de ação é **"Ver guia"** (não "Ver tarefa");
- Pode estar em estado **Calculando** enquanto a BHub apura (único estado especial que troca o botão por um spinner);
- Após calculadas, mostram data de vencimento e ficam disponíveis para download/pagamento;
- A Home mostra um bloco separado **"Guias de fevereiro"**, distinto do bloco de tarefas de entrada (o rótulo é genérico — não só impostos — pois outros tipos de guia serão entregues aqui);
- Existe um link **"Ver histórico de guias"** para acesso ao acumulado.

A **mensalidade BHub** é também tratada como tarefa de saída (cobrança interna), modelada igual às guias de impostos.

### Folha de pagamento

Entregável da BHub que vive **dentro do bloco de Guias**, mas tem um ciclo de aprovação próprio (subtipo `folha-pagamento` em `TarefaSaida`, com `statusFolha`, `arquivoFolha` e `historicoFolha`). Diferente das guias, tem chip de **carteira** (`Wallet`), botão **"Ver folha"** e um **badge de status próprio** (`FolhaStatusBadge`). Três estados (`StatusFolha`):

| Estado | Badge | O que o cliente vê no detalhe |
|---|---|---|
| **Em processamento** | cinza (spinner) | Aviso "disponível até o dia X" + card **"Apontamento em folha"** com CTA que (no protótipo) é placeholder — o fluxo real abre em Solicitações. Card **clicável** (≠ guia "Calculando", que é desabilitada). |
| **Aguardando aprovação** | âmbar (`warning`) | Download da versão enviada pela BHub + **Aprovar** (AlertDialog) ou **Solicitar ajustes** (motivo + anexo opcional) + **histórico** das trocas. Feedback inline (mesmo padrão do `RejeitadosBody`; o badge do header reflete o seed). |
| **Aprovado** | verde (`success`) | Entregável final para download + histórico completo (read-only). |

Simulação no seed (`folhaPagamento`/`folhaPassada`): mês atual (02/2026) **aguardando aprovação**; meses passados **aprovados** com históricos variados (`direta`, `uma-volta`, `duas-voltas`); meses futuros **em processamento**. A troca BHub↔cliente é renderizada pela timeline `HistoricoFolha`.

### Página inicial do Hub (Início)

Camada de **visão geral** acima de Tarefas (rota `/inicio`, `src/pages/PaginaInicial.tsx`). Conecta as áreas do Hub e responde, numa olhada: o que depende de você agora, o que está em andamento e o que a BHub prepara. **Não duplica** Tarefas — resume e **linka** para a interna real de cada item (`/tarefas/:id`).

- **Selector** `src/lib/inicio.ts` (`getInicioVM`): função **pura** (zero React) que lê os mesmos seeds e a MESMA regra de status (`deriveStatusEntrada`) da área de Tarefas e monta o view-model — saudação, subtítulo dinâmico, pendências, acompanhamento e concluídas. Recebe `isPaga` (do store `useGuiasPagas`) por injeção, mantendo-se pura.
- **Pendências** = entradas em aberto (`deriveStatusEntrada ≠ concluida`) + guias não pagas (exclui `calculando`), ordenadas por urgência (atrasadas primeiro, depois por prazo). A 1ª vira **"Próxima ação"** (destaque azul + CTA verde), a 2ª **"Depois"**, o resto colapsa em **"Mais N"**. O subtítulo pluraliza 0/1/N.
- **Para você acompanhar** = Fechamento e Folha (entregáveis recorrentes "fixo", **tom derivado do status real**) + Solicitações (mock) + colapsável **"Concluídas neste mês (N)"**.
- **Tom dos cards deriva do estado, nunca decorativo**: azul=foco/"a BHub prepara", verde=em dia/concluído, âmbar=depende de você, neutro=só leitura, vermelho=atrasada. Sempre com rótulo+ícone (status nunca só por cor). Banners eventuais têm liberdade criativa de cor. Detalhes visuais em `DESIGN.md`; visão de produto em `PRODUCT.md`.

### Solicitações (mock)

A área de **Solicitações** ainda não existe no protótipo (item da sidebar desabilitado, sem rota/dados). Na Página inicial elas aparecem de forma **ilustrativa e não navegável** — mock em `src/mocks/solicitacoes.ts` (ex.: "Admissão de funcionário", "Férias de funcionário", status "Em análise") — só para validar o conceito de visão única do Hub. Quando a área existir, o mock dá lugar à fonte real e os cards passam a linkar para a interna.

---

## Fluxo geral do usuário

```
/inicio              → Página inicial do Hub (visão geral: pendências + acompanhar + banners)
/                    → Dashboard de Tarefas (o antigo "Home"; item "Tarefas" da sidebar)
                       Layout: AppSidebar (preta) + header com título por rota + NotificationBell + conteúdo

Conteúdo da Home:
   ┌──────────────────────┐  ┌──────────────────────────────────────┐
   │  Calendário do mês   │  │  Suas tarefas de fevereiro            │
   │  (Fevereiro 2026)    │  │  - lista de tarefas de entrada        │
   │  - navegação por mês │  │  - barra de progresso "2/6"           │
   │  - dots nos dias com │  │                                        │
   │    tarefas           │  ├──────────────────────────────────────┤
   │                      │  │  Guias de fevereiro                  │
   │  Aviso amarelo:      │  │  - guias (saída) + Calculando         │
   │  "Tarefas em         │  │  - link "Ver histórico de guias"      │
   │   constante evolução"│  │                                        │
   └──────────────────────┘  └──────────────────────────────────────┘

Header da Home:
   - Título "Tarefas"  + subtítulo "Realize e acompanhe…"
   - CTA "Envio de documento fora do prazo" (sempre visível)
```

Itens da sidebar (defaults do `AppSidebar` do BSystem):

**Plataforma**
- Página inicial (`/inicio`) — Página inicial do Hub (habilitada; ativa ao abrir)
- Tarefas (`/`) *(badge "10"; ativa em `/` e `/tarefas/:id`)*
- Documentos e relatórios *(desabilitado; notification dot)*
- Solicitações *(desabilitado; com sub-itens)*

**Gestão**
- Minha empresa (com sub-itens)
- Central de Ajuda

---

## Funcionalidades-chave

### Já implementadas na Home

1. **Calendário do mês** (`CompetenciaCalendar`) com:
   - Botões prev/next como `IconButton` (BSystem) e setas Lucide.
   - Dias da semana em letra única (`D S T Q Q S S`).
   - Caption "Fevereiro 2026" com 1ª letra maiúscula.
   - Dots `mizu-flow-bold` nos dias com tarefa.
   - Destaque "hoje" simulado em **16/02/2026** (chip cinza claro) — passado via prop `today` da react-day-picker. Data no meio do mês para que os 3 status coexistam de forma coerente com os prazos.
   - Seleção controlada: clicar num dia com evento destaca o card correspondente (border `mizu-flow-bold`); clicar num dia sem evento ou fora do calendário deseleciona.
2. **Lista de tarefas de entrada** com ícone de status, data `DD/MM`, descrição "Prazo limite para…", badge de automação (apenas em tarefas elegíveis), botão "Ver tarefa" e menu kebab.
3. **Barra de progresso** "X/Y Tarefas concluídas" (`TaskProgress`) — fill verde, trilho cinza com borda.
4. **Lista de guias** com bloco "Calculando" (botão desabilitado com spinner) e link "Ver histórico de guias".
5. **Navegação por competência** via setas do calendário (`onMonthChange` zera a seleção).
6. **Atalho "Envio fora do prazo"** — botão no header navega para `/envio-fora-do-prazo`, tela funcional de upload de documentos (ver abaixo).
7. **Cards clicáveis** com hover sutil; click no card chama `onOpen(tarefa)` (stub aguardando o detalhe).

### Ainda por implementar

- **Detalhe da tarefa** (página interna): destino do click no card e do botão "Ver tarefa".
- **Confirmar "não tenho envio nesse mês"** — fluxo para sair do vermelho indo direto pro verde.
- ~~**Configurar automação**~~ — ✅ Open Finance: badge clicável → `AutomacaoOpenFinanceModal` (conectar/remover contas, mock) + integração no detalhe de extrato (`ExtratosBody`). Ver "Automação (Open Finance)". Falta: fluxo real de seleção de banco/login/redirect/autorização e tokenizar o roxo de automação (`@theme`).
- ~~**Fluxo de envio fora do prazo**~~ — ✅ tela `/envio-fora-do-prazo` (`src/pages/EnvioForaDoPrazo.tsx`): upload (drag & drop), `MonthYearPicker` para competência, `Select` de tipo de documento, `Textarea` de contexto e instruções. Sem persistência (protótipo): o submit dispara toast e volta para a Home. Falta: persistir/integrar e refinar a copy das instruções.
- **Histórico de guias** — destino do link no bloco de saídas.
- **Modo leitura em meses passados** — hoje a navegação funciona mas não bloqueia interação em meses anteriores.

---

## Convenções e detalhes que economizam tempo

- **🚫 NADA HARDCODADO — uso do DS é OBRIGATÓRIO.** Toda UI **deve** ser construída com componentes e tokens do `@bhubai/bhub-design-system`. É proibido:
  - recriar localmente componentes que já existem no DS (Button, Input, Select, Card, Textarea, Alert, MonthYearPicker, etc.);
  - usar cores/medidas cruas hardcodadas (ex.: `text-[#181d27]`, `bg-blue-500`) quando existe token semântico equivalente (`text-foreground`, `text-muted-foreground`, `bg-primary`, `border-border`, etc.).
  - **Única exceção:** se o que foi solicitado **não existir no DS**, aí sim crie um componente local em `src/components/gpc/` (compondo primitivos do DS + tokens semânticos, nunca hex cru) e deixe um TODO. Se um componente existe no código-fonte do DS mas ainda não está no `dist` vendorizado, **rebuilde o vendor** (ver `vendor/bhub-design-system/README.md`) em vez de hardcodar.
  - Telas legadas ainda contêm hex cru (ex.: `Home.tsx`); isso é dívida técnica a migrar, não um padrão a seguir.
- **PT-BR no domínio:** `Tarefa`, `competencia`, `guia`, `entrada`, `saida`, `automacao`. Identificadores genéricos em inglês quando óbvio.
- **Datas:** API ISO; formulário `Date`; display via `date-fns` com locale `ptBR`. Competência é string `YYYY-MM`.
- **`@bhubai/bhub-design-system` é a primeira opção** sempre. Se faltar componente, criar em `src/components/gpc/` com TODO. Não recriar Button/Input/Card localmente.
- **Cores semânticas, não cruas.** Quando o Figma usa um token (ex.: `mizu/flow/bold` = `#3b82f6`), registrar como CSS variable em `index.css` via `@theme` e usar como utility (`text-mizu-flow-bold`). Evitar `text-blue-500` na lib do código. Token vive localmente enquanto o DS não publica.
- **Aliasing:** importações usam `@/...`. Evitar caminhos relativos longos.
- **Sem testes e sem lint configurados** no protótipo. `npm run typecheck` é o único smoke test — não tente rodar `npm run lint` ou `npm run test`.
- **MSW:** `public/mockServiceWorker.js` é versionado. Se atualizar versão do MSW, rodar `npm run msw:init`. Handlers ficam **vazios** — protótipo sem API.
- **BSystem vendorizado:** o pacote vem de `file:./vendor/bhub-design-system` (build pré-compilado). Para atualizar o DS, rebuilde a partir da `main` + overlay da sidebar e copie o `dist` — receita em `vendor/bhub-design-system/README.md`. `npm install` ainda pode requerer `NPM_AUTH_TOKEN` para outras deps.
- **AppSidebar não navega sozinho:** os itens do `AppSidebar` (sidebar v2) renderizam como `<button>` e **não** fazem navegação própria — o `NavItem.href` é usado só para casar o item ativo, não há `onNavigate` nem link real. A navegação é feita por **delegação de clique no `Layout`** (lê o texto do `[data-sidebar="menu-button"]`, casa com o item habilitado e chama `navigate()` do React Router). Ao habilitar um novo item de menu, garanta que ele entre nessa lógica (item sem `disabled` + `href` começando com `/`).
- **Calendar do DS é capricho:** o `Calendar` do BSystem tem layout de nav absoluto que depende de `months: relative`. Se sobrescrever `classNames`, manter o `relative` em `months`, neutralizar `button_previous`/`button_next` (defaults trazem `size-(--cell-size)` que estoura o tamanho), e descartar o `className` recebido nos custom `PreviousMonthButton`/`NextMonthButton` antes de passar pro `IconButton`.

## Status do protótipo

**Já implementado:**
- Setup do projeto (Vite/React/TS/Tailwind/BSystem).
- `Layout` com `AppSidebar` (sidebar v2 do BSystem, ainda não mergiada na `main` — entra via overlay no vendor) + topbar com `NotificationBell`. Padding do conteúdo: `pt-14 px-12 pb-12` (56px topo).
- Tipos de domínio em `src/types/gpc.ts`.
- Utilitários de competência em `src/lib/competencia.ts`.
- Seeds mockados em memória (`src/mocks/seed.ts`) para 02/2026.
- Token semântico local `mizu-flow-bold` em `index.css` (substituindo `blue-500` da paleta crua).
- Home completa (`src/pages/Home.tsx`) com header + calendário interativo + bloco de entradas + bloco de guias. Detalhes em "Funcionalidades-chave".
- **Página inicial do Hub** (`/inicio`, `src/pages/PaginaInicial.tsx`): visão geral com Pendências do mês (próxima ação + depois + mais), Para você acompanhar (fechamento, folha, Solicitações mock + concluídas) e banners eventuais. Selector puro `src/lib/inicio.ts`, cards em `src/components/gpc/inicio/`, mock em `src/mocks/solicitacoes.ts`. Sidebar e título do header passam a derivar da rota (`buildGpcNavGroups` + `useLocation`). Visão de produto/design em `PRODUCT.md`/`DESIGN.md`.
- MSW carregado mas com `handlers` vazio (intencional — ver memória do projeto sobre escopo de protótipo).

**Ainda por fazer (roadmap explícito):**
- Página de detalhe da tarefa (rota e UI).
- Fluxo de upload de arquivos.
- Fluxo "não tenho envio nesse mês".
- Histórico de guias.
- Fluxo "Envio fora do prazo".
- ~~Configuração de automação a partir do badge "Automatizar".~~ ✅ Open Finance (modal + store por conta + integração no detalhe de extrato). Falta o fluxo real de banco/login/autorização Pluggy.
- Modo leitura em meses anteriores (hoje a navegação funciona, mas não restringe interação).
