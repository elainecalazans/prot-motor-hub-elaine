---
name: GPC — Gestor de Pendências do Cliente
description: Painel mensal calmo que transforma obrigações fiscais em controle, sobre o design system BHub (BSystem).
colors:
  background: "#ffffff"
  foreground: "#0a0a0a"
  primary: "#171717"
  primary-foreground: "#fafafa"
  muted: "#f5f5f5"
  muted-foreground: "#737373"
  border: "#e5e5e5"
  ring: "#d4d4d4"
  success: "#16a34a"
  success-subtle: "#f0fdf4"
  success-text: "#16a34a"
  warning: "#f59e0b"
  warning-subtle: "#fffbeb"
  warning-text: "#d97706"
  info: "#2563eb"
  destructive: "#dc2626"
  automacao: "#9333ea"
  automacao-subtle: "#faf5ff"
  automacao-strong: "#7e22ce"
  automacao-muted: "#f3e8ff"
  calendario-selecao: "#3b82f6"
  sidebar: "#0a0a0a"
  sidebar-foreground: "#a3a3a3"
typography:
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.33
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "16px"
  status-chip-done:
    backgroundColor: "{colors.success-subtle}"
    textColor: "{colors.success}"
    rounded: "{rounded.lg}"
    size: "36px"
  status-chip-late:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive}"
    rounded: "{rounded.lg}"
    size: "36px"
  status-chip-idle:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.lg}"
    size: "36px"
  status-chip-attention:
    backgroundColor: "{colors.warning-subtle}"
    textColor: "{colors.warning-text}"
    rounded: "{rounded.lg}"
    size: "36px"
  badge-automacao-on:
    backgroundColor: "{colors.automacao}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  badge-automacao-cta:
    backgroundColor: "{colors.automacao-subtle}"
    textColor: "{colors.automacao}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  badge-automacao-on-hover:
    backgroundColor: "{colors.automacao-strong}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  badge-status-progress:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  badge-status-attention:
    backgroundColor: "{colors.warning-subtle}"
    textColor: "{colors.warning-text}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  badge-status-done:
    backgroundColor: "{colors.success-subtle}"
    textColor: "{colors.success-text}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
---

# Design System: GPC — Gestor de Pendências do Cliente

## 1. Overview

**Creative North Star: "O Painel de Controle Calmo"**

O GPC é um painel mensal que pega algo que normalmente gera ansiedade — obrigações fiscais, prazos, multas — e devolve a sensação de "está tudo sob controle". A interface não grita, não enfeita e não impressiona: ela organiza. Cada tela responde, sem esforço, às três únicas perguntas que importam para o cliente: o que falta, até quando, e o que já está ok. A clareza de estado é o produto.

Visualmente isso se traduz em um sistema **calmo, claro e flat**, construído inteiramente sobre o design system da BHub (o **BSystem**). Superfícies brancas, texto quase-preto de alto contraste, neutros frios para o secundário, e cor usada com extrema parcimônia — só onde carrega significado de estado (verde = feito, vermelho = vencido, roxo = automação). O único elemento de peso visual forte é a **sidebar preta** (`#0a0a0a`), que ancora a navegação e deixa o conteúdo respirar em branco.

Este sistema rejeita explicitamente quatro coisas (de PRODUCT.md): a densidade do **ERP contábil legado**, os clichês do **SaaS genérico de template** (grids de cards idênticos, gradientes decorativos, hero-métrica), a frieza da **fintech corporativa** (azul-marinho institucional) e a intimidação do **burocrático/governamental** (cara de e-CAC). O cliente não é contador; a tela tem que parecer feita para gente.

**Key Characteristics:**
- Flat por padrão: profundidade vem de borda + cor de superfície, não de sombra.
- Cor é semântica, nunca decorativa: cada cor saturada significa um estado.
- Neutros frios e alto contraste de texto; legibilidade acima de elegância.
- Uma única tipografia (Inter) carregando toda a hierarquia por peso e tamanho.
- BSystem é a fonte da verdade; o GPC compõe, não reinventa.

## 2. Colors

Paleta neutra-fria de base, com acentos saturados reservados a significado de estado. O protótipo roda apenas no tema claro do BSystem.

### Primary
- **Quase-Preto de Comando** (`#171717`): cor primária do BSystem. Botões primários, ênfase forte. É o "preto" da marca — nunca um preto puro `#000`.
- **Tinta de Texto** (`#0a0a0a`): `foreground`. Todo texto de corpo e títulos. Contraste altíssimo sobre branco, proposital — legibilidade para leitura apressada.

### Secondary
- **Branco de Superfície** (`#ffffff`): `background`. Fundo de cards e da área de conteúdo.
- **Cinza-Névoa** (`#f5f5f5`): `muted` / `secondary`. Blocos de agrupamento (ex.: `SectionTable`), trilhos de progresso, chip de status neutro.
- **Cinza-Legenda** (`#737373`): `muted-foreground`. Texto secundário, descrições "Prazo limite para…", legendas.

### Tertiary
- **Roxo de Automação** (`#9333ea`): identidade visual exclusiva da automação (Open Finance e afins). Sólido = "Automático"/"Automática" (conta conectada); tracejado sobre `#faf5ff` = "Automatizar" (CTA elegível). Veste o badge da tarefa (`AutomacaoBadge`) e a pílula por conta (`ContaAutomaticaBadge`). Único uso legítimo de roxo no sistema.
- **Roxo de Automação — Forte** (`#7e22ce`, `automacao-strong`): tom mais escuro da mesma matiz, reservado ao **hover/foco** dos badges de automação clicáveis (e ao texto da nota "Pronto…" sobre `#faf5ff`). Comunica que a tag é interativa — affordance que o Figma/DS não previam.
- **Azul de Calendário** (`#3b82f6`, token `mizu-flow-bold`): marca dias com tarefa (dots) e a seleção ativa no `CompetenciaCalendar`. Exclusivo do calendário.

### Neutral
- **Borda** (`#e5e5e5`): `border` / `input`. Toda separação estrutural (cards, trilhos, inputs). É o que cria profundidade na ausência de sombra.
- **Anel de Foco** (`#d4d4d4`): `ring`. Foco de teclado.

### Estado (semânticas do BSystem)
- **Verde-Concluído** (`#16a34a`, `success`; superfície `#f0fdf4` `success-subtle`, texto `#16a34a` `success-text`): tarefa concluída e entregável aprovado/fechado. O par subtle+text veste o chip de documento verde dos entregáveis (folha aprovada, fechamento concluído) e a badge de status "Concluído/Aprovada".
- **Vermelho-Vencido** (`#dc2626`, `destructive`): prazo de **entrada** encerrado sem envio. Reservado ao atraso real do cliente — **não** é usado para pendências de entregáveis (ver Regra do Âmbar para Pendência).
- **Âmbar-Atenção** (`#f59e0b` / texto `#d97706` `warning-text` / superfície `#fffbeb` `warning-subtle`, `warning`): atenção não-punitiva que depende de você. Cobre o banner "Tarefas em constante evolução", a **ação necessária / pendências do Fechamento contábil** e o **aguardando aprovação da Folha**. O par subtle+text veste tanto o chip de documento âmbar quanto as badges de status.
- **Azul-Informativo** (`#2563eb`, `info`): mensagens informativas.

### Named Rules
**A Regra da Cor com Significado.** Nenhuma cor saturada é decorativa. Verde, vermelho, âmbar, azul e roxo cada um carrega exatamente um significado de estado. Se um elemento não comunica estado, ele é neutro (branco, cinza-névoa, tinta). Gradientes decorativos são proibidos.

**A Regra do Estado Tríplice.** Os três status de tarefa (cinza não-iniciada / verde concluída / vermelho vencida) jamais se distinguem só por cor: sempre ícone (relógio / check) + cor + rótulo acessível, simultâneos.

**A Regra do Âmbar para Pendência.** Pendência de entregável não é erro: o que depende de você (movimentações a resolver no Fechamento, aprovação da Folha) usa **âmbar (`warning`), nunca vermelho (`destructive`)**. O vermelho fica reservado ao único caso punitivo — prazo de entrada estourado pelo cliente. Âmbar diz "precisa de você"; vermelho diz "passou do prazo". Não troque um pelo outro.

**A Exceção dos Banners Eventuais.** Há uma — e apenas uma — zona com liberdade de cor: os **banners eventuais** da Página inicial (`BannerEventual`: certificado digital a vencer, atualização cadastral). Por serem avisos pontuais e não-recorrentes, eles podem usar **cores e gradientes próprios fora da paleta semântica** (ex.: gradiente âmbar→laranja, gradiente violeta→índigo) para chamar atenção sem virar ruído — decisão intencional do time. Isto **não** afrouxa a Regra da Cor com Significado nem libera o roxo: em **todo o resto do sistema** a cor segue semântica e o **roxo permanece exclusivo de automação (Open Finance)**. O gradiente violeta de um banner é decoração consciente e contida ao banner — nunca um sinal de automação.

## 3. Typography

**Display Font:** — (não há fonte de display; o sistema não tem heros).
**Body Font:** Inter (com `sans-serif` de fallback).
**Label/Mono Font:** Inter (o BSystem aponta mono e serif também para Inter; é uma família única).

**Character:** Uma só voz tipográfica. Inter, com `font-feature-settings: "cv11", "ss01", "ss03"` ligadas no `html`, faz toda a hierarquia por peso e tamanho — neutra, legível e despretensiosa, exatamente o tom de uma ferramenta de trabalho. Sem pareamento de fontes; o contraste vem de peso, não de família.

### Hierarchy
- **Headline** (600, 24px, line-height 1.25, tracking -0.01em): título de página, ex.: "Tarefas".
- **Title** (600, 18px, line-height 1.4): títulos de bloco, ex.: "Suas tarefas de fevereiro", "Entregáveis de fevereiro".
- **Body** (400, 14px, line-height 1.5): texto padrão de tarefas, descrições, copy. Limite de 65–75ch em prosa longa.
- **Label** (600, 12px, line-height 1.33): contadores ("2/6"), badges de automação, metadados de data `DD/MM`.

### Named Rules
**A Regra da Voz Única.** Uma família (Inter), hierarquia por peso/tamanho. Nunca introduzir uma segunda fonte "para dar personalidade" — a personalidade vem da clareza, não do contraste tipográfico.

## 4. Elevation

O sistema é **flat por padrão**. Profundidade não vem de sombra, e sim de **borda (`#e5e5e5`) + troca de cor de superfície** (branco sobre cinza-névoa). Cards são superfícies brancas delimitadas por borda dentro de blocos `#f5f5f5`; o trilho de progresso é cinza com borda. A única hierarquia de "peso" real é a sidebar preta contra o conteúdo claro.

Sombras só são admissíveis como resposta a estado efêmero e flutuante — overlays que precisam escapar do fluxo (dropdowns, dialogs, popovers do BSystem/Radix). Nunca como decoração de card em repouso.

### Named Rules
**A Regra do Flat em Repouso.** Superfícies são planas quando paradas. Elevação só aparece em resposta a estado: hover sutil em card clicável, ou um overlay que sobe acima do conteúdo. Card com sombra ambiente "para destacar" é proibido — use borda.

## 5. Components

Primitivos vêm do **BSystem** (`@bhubai/bhub-design-system`) — Button, Input, Select, Textarea, Card, Alert, MonthYearPicker, Calendar, AppSidebar. Abaixo, os primitivos-chave e os **componentes-assinatura do GPC** (compostos sobre o DS em `src/components/gpc/`).

### Buttons
- **Shape:** cantos suavemente arredondados (6px, `rounded-md`).
- **Primary:** fundo `#171717`, texto `#fafafa`. Ação principal de uma tela.
- **Hover / Focus:** anel de foco `#d4d4d4` visível ao teclado; foco nunca suprimido.
- **Secondary / Ghost:** variantes do DS sobre `secondary` (`#f5f5f5`); usar para ações de apoio.

### Chips — StatusIcon (assinatura)
- **Style:** quadrado 36×36 (`h-9 w-9`), `rounded-lg` (8px), ícone Lucide 16px centralizado, `role="img"` + `aria-label`.
- **State:** `não-iniciada/calculando` → superfície neutra + relógio cinza; `concluída` → superfície verde-suave + check verde; `atrasada` → superfície vermelha-suave + relógio vermelho. Estado comunicado por cor **e** ícone **e** rótulo.

### Chips — Entregável: documento colorido por status (assinatura)
Mesmo molde 36×36 do StatusIcon, mas usado pelas tarefas de **saída/entregáveis** (Guia, Folha de pagamento, Fechamento contábil). O ícone é **sempre o documento (`FileText`)** — o que muda é só a superfície, refletindo o status:
- **Neutro** (`#f5f5f5` + cinza): guia padrão, folha/fechamento ainda em processamento/andamento.
- **Âmbar** (`warning-subtle` + `warning-text`): depende de você — folha aguardando aprovação, fechamento com pendências.
- **Verde** (`success-subtle` + `success-text`): entregável fechado — folha aprovada, fechamento concluído.

Nunca trocar o ícone por estado (sem `CircleAlert`/`CheckCircle`/`Loader2` no chip): o significado vem da **cor + badge + rótulo** ao lado, mantendo o documento como assinatura visual única dos entregáveis. O `aria-label` carrega o estado para leitores de tela.

### Chips — AutomacaoBadge (assinatura)
- **Style:** pill `rounded-lg`, padding `2px 8px`, label 12px semibold, ícone Zap 12px.
- **State:** `Automático` (≥1 conta conectada) → roxo sólido `#9333ea`, texto branco; **hover** `#7e22ce`; **tooltip** com a contagem de contas. `Automatizar` (CTA elegível, 0 contas) → borda tracejada roxa sobre `#faf5ff`, texto roxo; **hover** aprofunda para `#7e22ce`. Aparece só em tarefas elegíveis (extratos).
- **Clicável em ambos os estados:** abre o modal de Open Finance. O estado é **derivado** do nº de contas conectadas (`useContasAutomatizadas`), não fixo na tarefa.

### Signature Component — Open Finance (AutomacaoOpenFinanceModal + ContaAutomaticaBadge)
Fluxo de automação de extratos via Open Finance, aberto pelo `AutomacaoBadge` (Home) ou pelo card "Envio automático" no detalhe de extrato.
- **`AutomacaoOpenFinanceModal`** (`Dialog` do DS, `sm:max-w-lg`, `p-0` para o header sangrar até a borda): **header band** em `automacao-subtle` (medalhão `bg-automacao` com Zap + título `text-xl` + apoio) — a faixa declara o assunto "automação" e ancora a hierarquia num ponto focal, sem decorar. Abaixo, **ação primeiro**: seção de contas — **empty state como momento de ativação** (medalhão `automacao-subtle`, headline "Conecte sua primeira conta", benefício, CTA primário e a microcopy de segurança "Conexão segura, regulada pelo Open Finance") ou **lista das conectadas** (ícone tingido em `automacao-subtle`/`automacao`, badge "Automática", contador, "Conectar outra conta" em `outline`). Por último, **"Como funciona"** como referência secundária (separador `border-t` + stepper vertical numerado de 5 passos: círculo `bg-primary` + linha conectora `border`). O resultado ("e **pronto!** A conta passa a enviar os extratos automaticamente…") está embutido no **passo 5**, não num alerta roxo separado — isso encurta o modal e elimina o scroll. A ação vem antes da explicação para o CTA não cair abaixo da dobra, e o corpo usa cap dinâmico (`max-h-[calc(100vh-9rem)]`) para crescer até caber e só rolar quando a tela for muito baixa. Os números do stepper usam o **primário (preto)**, não o roxo — o roxo fica reservado ao significado "automação", não à ordenação.
- **`ContaAutomaticaBadge`**: pílula "Automática" no mesmo molde sólido do "Automático" (`#9333ea` + texto branco + Zap 12px). Marca a conta conectada na lista do modal e no detalhe.
- **Stepper numerado é legítimo aqui** (sequência real e ordenada), não o anti-pattern de "01/02/03" decorativo — ver Do's and Don'ts.

### Signature Component — ExtratosBody (detalhe de extrato)
Corpo da tarefa de extrato, três cards: **"Envio automático"** (lista as contas conectadas com `ContaAutomaticaBadge`; botão "Configurar/Gerenciar" centralizado no rodapé abre o modal), **"Enviar extrato manualmente"** (`Select` só com contas **não** conectadas + `FileDropzone`; mensagem quando todas estão automáticas) e **"Extratos enviados"**. Conectar/remover no modal reflete na hora aqui e no badge da Home (store compartilhado).

### Cards / Containers — TarefaCard (assinatura)
- **Corner Style:** `rounded-lg` (8px).
- **Background:** branco; agrupados dentro de blocos `#f5f5f5` (`SectionTable`).
- **Shadow Strategy:** nenhuma em repouso (ver Elevation). Hover sutil em cards clicáveis.
- **Border:** `#e5e5e5`.
- **Internal Padding:** 16px.

### Inputs / Fields
- **Style:** do BSystem — borda `#e5e5e5`, fundo branco, `rounded-md`.
- **Focus:** anel `#d4d4d4`.
- **Error:** estados `destructive` do DS quando aplicável.

### Navigation — AppSidebar (assinatura)
- **Style:** sidebar **preta** (`#0a0a0a`), texto `#a3a3a3`, item ativo `#fafafa` sobre `#262626`. Override local restaura a "sidebar v2" escura enquanto não é mergiada na `main` do DS.
- **Topbar:** padding de conteúdo `pt-14 px-12 pb-12`; `NotificationBell` à direita.

### Signature Component — TaskProgress
Barra de progresso 120×8px, trilho `#f5f5f5` com borda, preenchimento verde (`emerald-600`) com `transition-[width]`, precedida de "X/Y Tarefas concluídas".

### Signature Component — CompetenciaCalendar
Calendário do BSystem (react-day-picker) com nav por `IconButton`, dots `#3b82f6` em dias com tarefa, "hoje" simulado destacado, e seleção controlada que espelha o card correspondente. Layout depende de `months: relative` (capricho do `Calendar` do DS — ver CLAUDE.md).

### Signature Component — Status Badges (FolhaStatusBadge / FechamentoStatusBadge)
Badges de status dos entregáveis na seção **"Entregáveis de {mês}"** e no header do detalhe. Reaproveitam as variantes semânticas do `Badge` do DS (sem cor crua), com ícone Lucide 12px + rótulo:
- **Em processamento / Em andamento** → variante `secondary` (cinza), ícone `Loader2` **com `animate-spin`**.
- **Aguardando aprovação** → variante `warning` (âmbar), ícone `Clock`.
- **Pendências** (fechamento) → variante `warning` (âmbar), ícone `TriangleAlert` + contagem.
- **Aprovada / Concluído** → variante `success` (verde), ícone `Check` — porém no card o estado final dispensa badge (o chip de documento verde já comunica).

**A Regra do Loading Vivo.** Todo estado "em processamento/andamento" gira: o spinner sempre leva `animate-spin`, tanto na badge do card quanto na do header. Spinner estático lê como ícone quebrado.

### Signature Component — FechamentoContabilBody
Painel de detalhe do Fechamento contábil. Compõe, de cima para baixo: `Alert` de origem (via caixa / com pendências em `warning`), card **"Andamento do fechamento"** com as etapas (notas → extrato → impostos → fechamento), card **"Precisamos da sua ajuda"** com as movimentações não identificadas resolvidas inline (`Select` de categoria + `Textarea` + confirmar), e a `Table` **"Fechamentos anteriores"** com linhas **clicáveis** (navegam para o mês), `Tooltip` por status e `ChevronRight`. Empty state quando o mês ainda está em andamento.

### Signature Component — FolhaPagamentoBody
Painel de detalhe da Folha de pagamento, com fluxo de aprovação próprio: download da versão enviada, **Aprovar** (`AlertDialog`) ou **Solicitar ajustes** (motivo + anexo), e timeline `HistoricoFolha` das trocas BHub ↔ cliente. Feedback inline no mesmo padrão do `RejeitadosBody`.

### Tela — Página inicial (Overview)
Tela conectiva do Hub em `/inicio` (`src/pages/PaginaInicial.tsx`): o panorama do mês que responde, sem densidade, às três perguntas de sempre — o que falta, até quando, o que já está ok. Não é uma segunda área de Tarefas; é o **resumo** que aponta para as áreas reais (cada item linka para `/tarefas/:id`).

**Racional — honra "O Painel de Controle Calmo".** Visão geral, não densidade: reusa a gramática de página (`mx-auto max-w-[1310px] flex-col gap-8`), blocos `SectionTable` e os primitivos do DS (`Collapsible`, `Badge`, `Button`), em vez de inventar layout novo. Sem calendário, sem barra de progresso, sem hero-métrica — o whitespace é recurso. Uma **única ação primária em destaque por vez** (a "Próxima ação"); o resto resume e linka. O tom (cor) de cada card **deriva do estado real do entregável** (selector `getInicioVM` em `src/lib/inicio.ts`, que reusa `deriveStatusEntrada` e os status de folha/fechamento), nunca é decorativo. Segue **Flat em Repouso**, **Cor com Significado**, **Estado Tríplice** e **Voz Única**.

**Sistema de tints semânticos dos cards de overview.** A superfície de cada card carrega o estado — e o estado nunca fica só na cor: vai sempre com **rótulo de texto + ícone** (a11y). Os tints derivam do view-model, não do layout:

| Tint | Token | Significado | Quando |
|---|---|---|---|
| **Azul** | `bg-blue-50` + borda `mizu-flow-bold` | Foco / "próxima ação" **e** informativo "a BHub prepara" | Card de destaque (`ProximaAcaoCard`); folha em processamento / aguardando aprovação. Mesmo token do "selecionado" do calendário. |
| **Verde** | `emerald` (`bg-emerald-50`) | Em dia / concluído / em andamento sem pendência | Fechamento concluído, folha aprovada, itens concluídos do mês. |
| **Âmbar** | `amber` (`bg-amber-50`) | Depende de você, **não punitivo** | Fechamento com movimentações a resolver, folha aguardando aprovação. Segue a Regra do Âmbar para Pendência. |
| **Cinza/neutro** | `border-border bg-white` | Informativo / sem ação possível | Solicitações "Em análise" (ilustrativas), itens só de leitura. |
| **Vermelho** | `rose` (badge `destructive` "Atrasada") | Pendência **realmente atrasada** | Pendência cujo prazo de entrada estourou. Mantém a regra existente do vermelho. |

Cards ilustrativos (mock) não são focáveis — `role="button"`/`tabIndex` só quando há `href`. Animações respeitam `prefers-reduced-motion`.

**Componentes novos** (`src/components/gpc/inicio/`):
- **`ProximaAcaoCard`** — destaque da pendência mais urgente: superfície azul + borda `mizu-flow-bold`, badge "Próxima ação" (+ "Atrasada" quando for o caso), CTA verde (`variant="success"`) para a interna real.
- **`PendenciaCard`** — pendência secundária ("Depois") e as linhas reveladas em "Mais N": superfície branca, badge "Depois" (cinza) ou "Atrasada" (vermelho), CTA `outline`.
- **`AcompanharCard`** — tile de "Para você acompanhar", tonalizado pelo estado (tint deriva de `tom`), chip 36×36, tag "fixo" para entregável recorrente; clicável só quando navegável.
- **`BannerEventual`** — banner de aviso pontual com cores/gradientes próprios (ver Exceção dos Banners Eventuais em §2). Única zona com liberdade de cor.

**Empty states calmos.** 0 pendências exibe **"Tudo em dia por aqui"** (medalhão verde discreto + uma frase tranquilizadora) — sem confete, sem número gigante, sem celebração. "Para você acompanhar" vazio diz, no mesmo tom, "Nada para acompanhar agora". O calmo também vale quando não há nada a fazer.

**A Regra do Resumo Único.** A Página inicial **nunca repete a densidade de Tarefas**: ela resume e linka, com **uma única ação primária em destaque por vez** (a "Próxima ação"). As demais pendências caem para CTA secundário (`outline`) ou ficam recolhidas em "Mais N pendências"/"Concluídas neste mês" (`Collapsible`). Se a home começar a clonar a lista completa de tarefas, com vários CTAs primários competindo, ela deixou de resumir e virou uma segunda área de Tarefas — exatamente o que esta regra proíbe. O overview aponta para a verdade; ele não é a verdade.

## 6. Do's and Don'ts

### Do:
- **Do** usar componentes e tokens do BSystem como primeira opção; só criar local (`src/components/gpc/`) quando o DS não cobrir, compondo primitivos + tokens semânticos.
- **Do** usar tokens semânticos (`text-foreground`, `bg-muted`, `border-border`, `text-muted-foreground`) em vez de cor crua.
- **Do** reservar cor saturada para significado de estado: verde concluído, vermelho vencido, âmbar aviso, roxo automação, azul calendário.
- **Do** tratar a automação (Open Finance) como estado **por conta**, derivado do store: o badge da tarefa só vira "Automático" com ≥1 conta conectada, e o envio manual continua disponível para as contas não conectadas. Remover automação usa `AlertDialog` âmbar (reversível, não punitivo).
- **Do** comunicar status sempre por cor + ícone + rótulo (nunca só cor).
- **Do** usar âmbar (`warning`) para pendência de entregável que depende do cliente; vermelho (`destructive`) só para prazo de entrada estourado.
- **Do** manter o ícone de **documento** como assinatura dos entregáveis (Guia/Folha/Fechamento), variando só a cor do chip pelo status.
- **Do** animar todo spinner de "processando/em andamento" com `animate-spin` (card e header), de forma consistente.
- **Do** manter superfícies flat; profundidade por borda `#e5e5e5`.
- **Do** garantir contraste AA (≥4.5:1 corpo, ≥3:1 texto grande) e foco de teclado visível.
- **Do** escrever copy em PT-BR claro, em segunda pessoa, traduzindo o fiscal para o humano.

### Don't:
- **Don't** parecer um **ERP contábil legado**: nada de tabelas cinzas intermináveis, densidade ou jargão fiscal cru.
- **Don't** cair no **SaaS genérico de template**: proibidos grids de cards idênticos repetidos ao infinito, gradientes decorativos e o template hero-métrica (número gigante + label).
- **Don't** virar **fintech corporativa fria**: sem azul-marinho institucional como cor dominante.
- **Don't** parecer **burocrático/governamental** (e-CAC, gov.br): nada de formulários intimidantes ou linguagem oficial de autoridade.
- **Don't** hardcodar cor crua quando existe token (ex.: `bg-[#f5f5f5]`, `text-emerald-600`). A rampa de automação já foi tokenizada em `@theme` (`automacao`, `automacao-strong`, `automacao-subtle`, `automacao-muted`) e migrada em `AutomacaoBadge`/`ContaAutomaticaBadge`/`AutomacaoOpenFinanceModal` — usar sempre os tokens (`bg-automacao`, `text-automacao-strong`, etc.), nunca o hex. Telas legadas com hex cru (ex.: `Home.tsx`) seguem como dívida a migrar.
- **Don't** usar vermelho (`destructive`) para pendência de entregável (movimentação a resolver, folha a aprovar): isso soa punitivo. É **âmbar**.
- **Don't** trocar o ícone do chip de entregável por estado (`CircleAlert`/`CheckCircle`/`Loader2` no chip): o documento é fixo; quem muda é a cor.
- **Don't** deixar spinner de status estático — sem `animate-spin` ele lê como ícone quebrado.
- **Don't** usar `border-left`/`border-right` colorida >1px como faixa-acento em cards ou alertas.
- **Don't** aplicar sombra ambiente em cards em repouso "para destacar" — use borda.
- **Don't** introduzir uma segunda família tipográfica.
