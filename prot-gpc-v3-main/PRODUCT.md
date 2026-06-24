# Product

## Register

product

## Users

**Persona primária — Cliente do escritório (empreendedor / PME).** Admin, RH ou perfil de leitura de uma empresa contratante da BHub. Normalmente **não** é contador nem tem familiaridade com a linguagem fiscal; usa o GPC no meio da rotina de tocar o próprio negócio, sem tempo nem paciência para burocracia. Job-to-be-done: saber, num só lugar, **o que precisa enviar** para a contabilidade, **até quando**, e **o que já está resolvido** — sem caçar e-mails, planilhas e mensagens. Contexto de uso: acesso pontual e mensal (atrelado à competência), muitas vezes apressado e, com frequência, no celular.

**Persona secundária — Operador BHub (sem UI neste protótipo).** É o "outro lado": produz as tarefas de saída (guias, cobranças), apura valores e configura recorrência/automação. Não tem interface aqui, mas todo o modelo de tarefas de entrada/saída existe para servir essa relação cliente ↔ BHub.

## Product Purpose

O **GPC — Gestor de Pendências do Cliente** é um módulo do Hub do Empreendedor (portal do cliente da BHub) que concentra, num **único calendário mensal por competência**, todas as obrigações da relação contábil: o que o cliente precisa enviar para a BHub (tarefas de **entrada**) e o que a BHub entrega ao cliente — guias de impostos e cobranças (tarefas de **saída**).

Existe porque hoje essas obrigações se espalham por e-mail, planilhas e mensagens, sem visibilidade do que está pendente, no prazo ou entregue. **Sucesso:** o cliente abre o GPC e em segundos entende o seu mês — o que falta, o que venceu, o que está ok — e consegue agir sozinho, sem suporte.

Parte dessa redução de esforço vem da **automação**: tarefas de entrada elegíveis (hoje, os **extratos bancários**) podem ser conectadas via **Open Finance**, e passam a chegar à contabilidade sozinhas — o cliente só envia manualmente o que ainda não automatizou. A melhor pendência é a que deixa de existir; menos tarefa manual recorrente é menos peso mensal para gerenciar.

> Nota de escopo: este repositório é um **protótipo navegável** com API mockada (MSW), criado para validar fluxos de UX e copy, alinhar regras de negócio com produto/operação e servir de referência viva para a engenharia. Sem persistência nem integração real.

## Página inicial (Início) — a porta de entrada do Hub

A **Página inicial do Hub** (rota `/inicio`) é a camada de visão geral conectiva que fica **acima** da área de Tarefas: um "resumo do meu mês" que responde em segundos **o que depende de mim agora**, **o que está em andamento** e **o que a BHub está preparando**.

### O que é / por que existe

- É a primeira tela ao entrar no Hub, não uma lista a mais. Concentra num só lugar o estado do mês para **reduzir a ansiedade do "o que falta?"** — direto ligado ao *Design Principle* nº 1 (**Transformar obrigação em controle**) e ao traço de marca **Confiável & tranquilizador**.
- **Não substitui Tarefas**: recorta, prioriza e linka. Reflete as **tarefas reais** da área de Tarefas (mesma base e mesma regra de status, `deriveStatusEntrada`) e cada item leva à página interna daquela tarefa (`/tarefas/:id`).

### Onde encaixa na jornada

- Primeira tela ao entrar; dela o cliente mergulha em **Tarefas**, **Solicitações**, **Documentos** e **Minha empresa** (item "Página inicial" da sidebar agora ativo).
- Hoje **convive com a área de Tarefas**, que segue na raiz (`/`) com o calendário por competência. A Início é o panorama; Tarefas é o detalhe executável.

### O que cada bloco faz pela persona (Cliente do escritório / Arthur)

- **Header** — saudação "Olá, Arthur" + um subtítulo que resume o mês em **uma frase** (ex.: "Você tem 5 pendências este mês — uma delas está atrasada desde 15/02."), pluralizada para 0/1/N (0 = "Você está em dia — nenhuma pendência este mês."). Dá o estado geral antes de qualquer rolagem. Atende **Direto & eficiente** e o princípio **Mostrar só o que exige ação agora**.
- **Pendências do mês** — recorta só o que **depende do cliente agora** (entradas em aberto + guias a pagar). A mais urgente vira a **"Próxima ação"** em destaque, com CTA primário ("Resolver agora" / "Enviar…"); a seguinte fica como **"Depois"**; o restante colapsa em "Mais N pendências". Ordena por urgência (atrasadas primeiro, depois por prazo). Reforça **Todo estado tem uma saída** e **Organizado & claro**.
- **Para você acompanhar** — o que está **sob a BHub ou em andamento**, para o cliente saber que não precisa agir: entregáveis recorrentes fixos (**Fechamento do mês**, **Folha de pagamento**) com status real ("Ação necessária", "Pronta para sua aprovação" etc.) + **Solicitações** ilustrativas ("Admissão de funcionário", "Férias de funcionário", em "Em análise"), além de um colapsável "Concluídas neste mês (N)". Separar "depende de mim" de "depende da BHub" é o coração do **Confiável & tranquilizador**.
- **Banners eventuais** — avisos **não recorrentes** (certificado digital a vencer, atualização cadastral), ilustrativos. Aparecem só quando há algo pontual, sem virar ruído fixo (**Mostrar só o que exige ação agora**).

### Solicitações (mock)

- **Solicitações ainda não existem como entidade real** no protótipo. Na Página inicial elas são **MOCK: ilustrativas e não navegáveis**.
- Estão ali de propósito — para **validar o conceito de visão única do Hub** (tudo do mês num lugar) antes de a área existir, sem prometer um fluxo que ainda não há.

### Critérios de sucesso

- O cliente **entende o mês em menos de 10s**, sem precisar abrir Tarefas.
- Identifica **a próxima ação** sem ajuda nem suporte.
- Distingue com clareza **"depende de mim"** de **"depende da BHub"**.
- Sai da tela com a sensação de que **"está sob controle"**.

## Brand Personality

Quatro traços, em ordem de prioridade quando entrarem em conflito:

1. **Confiável & tranquilizador** — o tom nº 1. O produto lida com algo que gera ansiedade (prazos, impostos, multas). Cada tela deve passar a sensação de "está sob controle": estado claro, próximo passo óbvio, nada de alarme desnecessário.
2. **Direto & eficiente** — ferramenta de trabalho, não vitrine. Vai direto ao ponto, sem fricção nem floreio. Respeita o tempo de quem só quer resolver e voltar ao negócio.
3. **Próximo & humano** — parceiro do empreendedor, não o Leão. Linguagem acessível em PT-BR, zero jargão contábil/fiscal jogado sem tradução.
4. **Organizado & claro** — hierarquia forte, cada pendência no seu lugar; clareza acima de densidade.

Voz: segunda pessoa, calorosa porém objetiva ("Envie seus extratos até 16/02"). Tom: o de um parceiro competente que já organizou tudo para você.

## Anti-references

O GPC NÃO deve parecer:

- **ERP / software contábil legado** — telas densas, tabelas cinzas intermináveis, jargão fiscal cru, visual datado. O cliente não é contador.
- **SaaS genérico de template** — grids de cards idênticos (ícone + título + texto) repetidos ao infinito, gradientes decorativos, o template hero-métrica (número gigante + label). Banidos.
- **Fintech corporativa fria** — azul-marinho institucional, sério e distante. O GPC é próximo, não imponente.
- **Burocrático / governamental** — cara de e-CAC ou gov.br: formulários intimidantes, linguagem oficial, a sensação de estar prestando contas a uma autoridade.

## Design Principles

1. **Transformar obrigação em controle.** O trabalho do produto é tirar o peso da pendência fiscal. Toda tela responde, sem esforço: o que falta, até quando, o que já está ok. Ansiedade é o inimigo; clareza de estado é o remédio.
2. **Todo estado tem uma saída.** Nenhuma pendência é beco sem saída. "Vermelho" (prazo estourado) não é punição — é uma tarefa com próximo passo óbvio que leva ao verde. Status honesto, ação sempre disponível.
3. **Traduzir o fiscal para o humano.** A complexidade contábil fica do lado da BHub; para o cliente, falamos a língua dele. Copy em PT-BR claro, sem jargão sem tradução, sem tom de autoridade.
4. **Mostrar só o que exige ação agora.** Recorte impiedoso por competência e por relevância. O cliente vê o mês dele e as tarefas que dependem dele — não um despejo de dados do back-office contábil.
5. **Consistência vence originalidade.** Isto é um produto, não uma peça de marca. O **BSystem** (design system da BHub) é a fonte da verdade: usar componentes e tokens semânticos do DS, criar local só quando o DS não cobre. Previsibilidade e coerência > efeito visual.

## Accessibility & Inclusion

- **WCAG 2.1 AA** como linha de base: contraste de texto ≥ 4.5:1 (≥ 3:1 para texto grande), navegação completa por teclado, foco visível, alvos de toque adequados (uso mobile esperado) e suporte a leitores de tela com rótulos/ARIA corretos.
- **Acessibilidade cognitiva é requisito, não extra.** O público é leigo em contabilidade; clareza de linguagem e de hierarquia é critério de acessibilidade aqui. Evitar jargão; explicar prazos e consequências em termos simples.
- **Status nunca só por cor.** Os três estados (cinza / verde / vermelho) sempre acompanhados de ícone + texto, para daltonismo e leitura rápida.
- **Reduced motion** respeitado em qualquer animação introduzida.
