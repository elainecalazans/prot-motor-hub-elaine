import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseCompetencia } from '@/lib/competencia';
import type {
  ArquivoFolha,
  Competencia,
  ContaFinanceira,
  EventoFolha,
  FechamentoHistorico,
  Operador,
  StatusFolha,
  TarefaEntrada,
  TarefaFechamento,
  TarefaSaida,
  TipoEntrada,
} from '@/types/gpc';

/**
 * Contas financeiras cadastradas pela empresa (Efferd). Usadas na tarefa de
 * envio de extratos bancários: o cliente seleciona uma conta e anexa o extrato
 * correspondente. Sem persistência — vivem em memória no protótipo.
 */
export const contasFinanceiras: ContaFinanceira[] = [
  { id: 'conta-itau', banco: 'Itaú', tipo: 'Conta corrente', identificacao: '•••• 1234' },
  {
    id: 'conta-bradesco',
    banco: 'Bradesco',
    tipo: 'Conta corrente',
    identificacao: '•••• 5678',
    // Token expirado: simula conta que estava automatizada mas perdeu autorização.
    tokenExpirado: true,
  },
  { id: 'conta-nubank', banco: 'Nubank', tipo: 'Conta PJ', identificacao: '•••• 9012' },
];

export const COMPETENCIA_ATUAL: Competencia = '2026-02';

/**
 * Competência usada para SIMULAR uma falha de carregamento (protótipo). Ao
 * navegar para este mês, a Home exibe um estado de erro com botão "Recarregar"
 * nos blocos de Tarefas e Entregáveis, em vez das listas. Os dados até existem
 * no seed — a falha é puramente de apresentação, para validar o estado de erro.
 */
export const COMPETENCIA_FALHA_SIMULADA: Competencia = '2025-10';

/**
 * Hoje simulado do protótipo: 16/02/2026. Meio do mês para que os 3 status
 * (cinza dentro do prazo, verde concluída, vermelho atrasada) coexistam.
 * Fonte única usada tanto pelo calendário quanto pela derivação de status.
 */
export const HOJE_SIMULADO = new Date(2026, 1, 16);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Mês de referência (anterior à competência), em minúsculo. Ex.: "janeiro". */
const refMes = (comp: Competencia) =>
  format(subMonths(parseCompetencia(comp), 1), 'MMMM', { locale: ptBR });

/** Mês de referência com ano, capitalizado. Ex.: "Janeiro 2026". */
const refMesAno = (comp: Competencia) =>
  cap(format(subMonths(parseCompetencia(comp), 1), 'MMMM yyyy', { locale: ptBR }));

/** Mês da própria competência, com ano, capitalizado. Ex.: "Fevereiro 2026". */
const mesAno = (comp: Competencia) =>
  cap(format(parseCompetencia(comp), 'MMMM yyyy', { locale: ptBR }));

type Tempo = 'passado' | 'futuro';

// Tarefas de entrada recorrentes (mesmas obrigações todo mês). Em meses
// passados aparecem concluídas (arquivos enviados → verde); em meses futuros
// ainda sem envio (prazo em aberto → cinza). O status é derivado em runtime.
function entradasRecorrentes(comp: Competencia, tempo: Tempo): TarefaEntrada[] {
  const m = refMes(comp);
  const concluido = tempo === 'passado';
  return [
    {
      id: `ent-${comp}-extratos`,
      categoria: 'entrada',
      tipo: 'extratos',
      titulo: 'Importar extratos bancários',
      descricao: `Importe os extratos bancários de ${m}`,
      competencia: comp,
      prazo: `${comp}-05`,
      // Extrato é elegível à automação (Open Finance) mas começa NÃO configurado:
      // o card exibe o CTA "Automatizar" até o cliente habilitar o fluxo.
      automacao: 'elegivel',
      arquivos: concluido ? 3 : 0,
    },
    {
      id: `ent-${comp}-notas`,
      categoria: 'entrada',
      tipo: 'notas',
      titulo: 'Enviar notas fiscais emitidas',
      descricao: `Envie as notas fiscais emitidas em ${m}`,
      competencia: comp,
      prazo: `${comp}-10`,
      automacao: 'nao-elegivel',
      arquivos: concluido ? 2 : 0,
    },
  ];
}

// Guias recorrentes. Guias não têm status de conclusão: são sempre neutras
// (cinza), com ícone de documento. O único estado especial é 'calculando'
// (valor ainda sendo apurado), usado pontualmente na competência atual.
function guiasRecorrentes(comp: Competencia): TarefaSaida[] {
  const ref = refMesAno(comp);
  return [
    {
      id: `sai-${comp}-iss`,
      categoria: 'saida',
      subtipo: 'guia-imposto',
      titulo: `Fechamento de ISS — ${ref}`,
      descricao: `Fechamento de ISS — ${ref}`,
      competencia: comp,
      prazo: `${comp}-10`,
      valor: 612.4,
      status: 'nao-iniciada',
      linhaDigitavel: '85800000006-1 12404000019-8 80000123456-7 89012345678-9',
    },
    {
      id: `sai-${comp}-dctf`,
      categoria: 'saida',
      subtipo: 'guia-imposto',
      titulo: `DCTFWeb + Retidos (Fiscal) — ${ref}`,
      descricao: `DCTFWeb + Retidos (Fiscal) — ${ref}`,
      competencia: comp,
      prazo: `${comp}-20`,
      valor: 1480.9,
      status: 'nao-iniciada',
      linhaDigitavel: '85810000014-8 80904000019-2 31000654321-4 56078901234-1',
    },
    {
      id: `sai-${comp}-pis`,
      categoria: 'saida',
      subtipo: 'guia-imposto',
      titulo: `Fechamento de PIS e COFINS — ${ref}`,
      descricao: `Fechamento de PIS e COFINS — ${ref}`,
      competencia: comp,
      prazo: `${comp}-25`,
      valor: 980,
      status: 'nao-iniciada',
      linhaDigitavel: '85820000009-8 80123000019-5 99000112233-1 44556677889-2',
    },
  ];
}

// Histórico: o ano de 2025 inteiro (jan–dez) + jan/2026 — todos navegáveis e
// populados. Set/dez e jan/2026 têm cenários curados (ver abaixo); os demais
// meses ganham as obrigações recorrentes como exemplo. A competência atual
// (02/2026) é curada à mão logo abaixo, com o cenário dos 3 status.
const MESES_2025: Competencia[] = Array.from(
  { length: 12 },
  (_, i) => `2025-${String(i + 1).padStart(2, '0')}` as Competencia
);
const MESES_PASSADOS: Competencia[] = [...MESES_2025, '2026-01'];
// Futuro com tarefas: apenas março. Abr/mai ficam navegáveis porém vazios
// (empty state na Home); o limite de navegação (+3 meses) é aplicado no
// calendário, não aqui.
const MESES_FUTUROS: Competencia[] = ['2026-03'];

// --- Competência atual (02/2026), curada ---
// Entradas: ent-1, ent-2 e ent-3 concluídas (verde); ent-4 expirada (vermelho).
const entradasAtual: TarefaEntrada[] = [
  {
    id: 'ent-1',
    categoria: 'entrada',
    tipo: 'extratos',
    titulo: 'Importar extratos bancários',
    descricao: 'Importe os extratos bancários de janeiro',
    competencia: COMPETENCIA_ATUAL,
    prazo: '2026-02-05',
    // Elegível à automação, ainda não configurada → CTA "Automatizar" no card.
    automacao: 'elegivel',
    arquivos: 3,
  },
  // Cenário lembrete (3 dias úteis restantes contra HOJE_SIMULADO 16/02):
  // prazo 19/02 = quarta → seg 17, ter 18, qua 19 = 3 dias úteis → lembrete âmbar.
  {
    id: 'ent-1b',
    categoria: 'entrada',
    tipo: 'extratos',
    titulo: 'Importar extratos — conta Santander',
    descricao: 'Importe os extratos bancários da conta Santander de janeiro',
    competencia: COMPETENCIA_ATUAL,
    prazo: '2026-02-19',
    automacao: 'elegivel',
    arquivos: 0,
  },
  // Cenário urgente (1 dia útil restante contra HOJE_SIMULADO 16/02):
  // prazo 17/02 = segunda → 1 dia útil → urgente vermelho.
  {
    id: 'ent-1c',
    categoria: 'entrada',
    tipo: 'extratos',
    titulo: 'Importar extratos — conta Inter',
    descricao: 'Importe os extratos bancários da conta Inter de janeiro',
    competencia: COMPETENCIA_ATUAL,
    prazo: '2026-02-17',
    automacao: 'elegivel',
    arquivos: 0,
  },
  {
    id: 'ent-2',
    categoria: 'entrada',
    tipo: 'notas',
    titulo: 'Enviar notas fiscais emitidas',
    descricao: 'Envie as notas fiscais emitidas em janeiro',
    competencia: COMPETENCIA_ATUAL,
    // Prazo em aberto (hoje simulado: 16/02): concluída mas ainda recebendo arquivos.
    prazo: '2026-02-20',
    automacao: 'nao-elegivel',
    // Muitos arquivos para demonstrar a paginação da lista de enviados.
    arquivos: 23,
  },
  {
    id: 'ent-3',
    categoria: 'entrada',
    tipo: 'fechamento',
    titulo: 'Insumos para fechamento',
    descricao: 'Envie os insumos necessários para o fechamento de janeiro',
    competencia: COMPETENCIA_ATUAL,
    prazo: '2026-02-10',
    automacao: 'nao-elegivel',
    arquivos: 1,
  },
  {
    id: 'ent-4',
    categoria: 'entrada',
    tipo: 'rejeitados',
    titulo: 'Documento rejeitado',
    descricao: 'Regularize o documento rejeitado pela contabilidade',
    competencia: COMPETENCIA_ATUAL,
    // Prazo já vencido (hoje simulado: 16/02) para demonstrar o aviso de atraso.
    prazo: '2026-02-15',
    automacao: 'nao-elegivel',
    arquivos: 0,
    documentoRejeitado: {
      id: 'rej-1',
      nomeArquivo: 'extrato-itau-janeiro.pdf',
      motivo: 'O arquivo está ilegível em algumas páginas. Reenvie o extrato completo e legível.',
      rejeitadoEm: '2026-02-12',
      operador: { nome: 'Mariana Lopes', iniciais: 'ML' },
    },
  },
  {
    id: 'ent-5',
    categoria: 'entrada',
    tipo: 'rejeitados',
    titulo: 'Documento rejeitado',
    descricao: 'Regularize o documento rejeitado pela contabilidade',
    competencia: COMPETENCIA_ATUAL,
    // Prazo em aberto (hoje simulado: 16/02) → status cinza (dentro do prazo).
    prazo: '2026-02-20',
    automacao: 'nao-elegivel',
    arquivos: 0,
    documentoRejeitado: {
      id: 'rej-3',
      nomeArquivo: 'comprovante-pagamento-fornecedor.pdf',
      motivo: 'Não foi possível identificar o favorecido. Reenvie o comprovante completo.',
      rejeitadoEm: '2026-02-16',
      operador: { nome: 'Mariana Lopes', iniciais: 'ML' },
    },
  },
  {
    id: 'ent-7',
    categoria: 'entrada',
    tipo: 'documentacao-pendente',
    titulo: 'Documentação pendente',
    descricao: 'Envie documentos extras para a contabilidade concluir o fechamento do mês',
    competencia: COMPETENCIA_ATUAL,
    // Prazo em aberto (hoje simulado: 16/02) → status cinza (pendente, dentro do prazo).
    prazo: '2026-02-18',
    automacao: 'nao-elegivel',
    arquivos: 0,
    solicitacao: {
      operador: { nome: 'Mariana Lopes', iniciais: 'ML' },
      enviadoEm: '2026-02-16',
      assunto: 'Documentos faltantes para o fechamento de janeiro',
      mensagem:
        'Olá! Ao revisar o fechamento de janeiro, identificamos que estão faltando alguns documentos para concluir a apuração:\n\n' +
        '• Comprovante de pagamento do fornecedor referente à nota nº 4521\n' +
        '• Contrato de prestação de serviço atualizado\n\n' +
        'Você pode anexar os arquivos por aqui ou responder com mais detalhes. Qualquer dúvida, é só falar. Obrigada!',
    },
  },
];

// Guias (02/2026): todas neutras (cinza), exceto a que ainda está sendo apurada.
//  - ISS (10/02): disponível → cinza
//  - DCTFWeb (20/02): disponível → cinza
//  - PIS e COFINS (25/02): ainda sendo apurada → Calculando
const guiasAtual: TarefaSaida[] = [
  {
    id: 'sai-1',
    categoria: 'saida',
    subtipo: 'guia-imposto',
    titulo: 'Fechamento de ISS — Janeiro 2026',
    descricao: 'Fechamento de ISS — Janeiro 2026',
    competencia: COMPETENCIA_ATUAL,
    prazo: '2026-02-10',
    valor: 612.4,
    status: 'nao-iniciada',
    linhaDigitavel: '85800000006-1 12404000019-8 80000123456-7 89012345678-9',
    downloads: [
      {
        id: 'dl-1',
        usuario: 'Arthur Moreira',
        iniciais: 'AM',
        baixadoEm: '2026-02-11T09:24:00',
      },
      {
        id: 'dl-2',
        usuario: 'Camila Souza',
        iniciais: 'CS',
        baixadoEm: '2026-02-11T14:02:00',
      },
    ],
  },
  {
    id: 'sai-2',
    categoria: 'saida',
    subtipo: 'guia-imposto',
    titulo: 'DCTFWeb + Retidos (Fiscal) — Janeiro 2026',
    descricao: 'DCTFWeb + Retidos (Fiscal) — Janeiro 2026',
    competencia: COMPETENCIA_ATUAL,
    prazo: '2026-02-20',
    valor: 1480.9,
    status: 'nao-iniciada',
    linhaDigitavel: '85810000014-8 80904000019-2 31000654321-4 56078901234-1',
    downloads: [],
  },
  {
    id: 'sai-3',
    categoria: 'saida',
    subtipo: 'guia-imposto',
    titulo: 'Fechamento de PIS e COFINS',
    descricao: 'Fechamento de PIS e COFINS',
    competencia: COMPETENCIA_ATUAL,
    prazo: '2026-02-25',
    status: 'calculando',
  },
];

// --- Folha de pagamento (entregável BHub, dentro do bloco de Guias) ---
// Entregável com ciclo de aprovação próprio. A simulação cobre os 3 estados:
//  - meses passados:  aprovada, com históricos de troca variados;
//  - mês atual (02):  aguardando aprovação (BHub enviou a 1ª versão);
//  - meses futuros:   em processamento (disponível até o fim do mês).

const OP_FOLHA: Operador = { nome: 'Beatriz Almeida', iniciais: 'BA' };
const CLIENTE_FOLHA: Operador = { nome: 'Arthur Moreira', iniciais: 'AM' };

/** Versão da folha enviada pela BHub (entra no histórico com o arquivo anexo). */
function evVersao(
  comp: Competencia,
  dia: string,
  versao: number,
  mensagem: string
): EventoFolha {
  return {
    id: `${comp}-folha-v${versao}`,
    autor: 'bhub',
    operador: OP_FOLHA,
    data: `${comp}-${dia}T09:30:00`,
    tipo: 'versao-enviada',
    mensagem,
    arquivo: {
      nome: `folha-pagamento-${comp}-v${versao}.pdf`,
      legenda: `Versão ${versao}`,
    },
  };
}

/** Rejeição da versão pelo cliente, com observações. */
function evRejeicao(comp: Competencia, dia: string, mensagem: string): EventoFolha {
  return {
    id: `${comp}-folha-rej-${dia}`,
    autor: 'cliente',
    operador: CLIENTE_FOLHA,
    data: `${comp}-${dia}T14:00:00`,
    tipo: 'rejeicao',
    mensagem,
  };
}

/** Aprovação final da folha pelo cliente. */
function evAprovacao(comp: Competencia, dia: string, mensagem: string): EventoFolha {
  return {
    id: `${comp}-folha-apr`,
    autor: 'cliente',
    operador: CLIENTE_FOLHA,
    data: `${comp}-${dia}T16:20:00`,
    tipo: 'aprovacao',
    mensagem,
  };
}

type CenarioFolha = 'direta' | 'uma-volta' | 'duas-voltas';

/** Histórico de uma folha já aprovada, variando o nº de idas e vindas. */
function historicoFolhaAprovada(comp: Competencia, cenario: CenarioFolha): EventoFolha[] {
  const v1 = evVersao(
    comp,
    '08',
    1,
    'Disponibilizamos a primeira versão da folha de pagamento para sua conferência e aprovação.'
  );
  switch (cenario) {
    case 'direta':
      return [v1, evAprovacao(comp, '12', 'Conferi os valores e está tudo certo. Folha aprovada!')];
    case 'uma-volta':
      return [
        v1,
        evRejeicao(comp, '11', 'O valor das horas extras do João Pedro está divergente. Pode revisar?'),
        evVersao(comp, '14', 2, 'Corrigimos as horas extras conforme apontado. Segue a versão revisada.'),
        evAprovacao(comp, '16', 'Agora está correto. Aprovada, obrigado!'),
      ];
    case 'duas-voltas':
      return [
        v1,
        evRejeicao(comp, '10', 'Faltou incluir a admissão da Carla, que entrou no dia 02.'),
        evVersao(comp, '13', 2, 'Incluímos a admissão da Carla. Segue a nova versão.'),
        evRejeicao(comp, '15', 'O desconto do vale-transporte ficou duplicado para dois colaboradores.'),
        evVersao(comp, '18', 3, 'Ajustamos o vale-transporte. Esta versão já está pronta para aprovação.'),
        evAprovacao(comp, '20', 'Tudo certo agora. Folha aprovada!'),
      ];
  }
}

function folhaPagamento(
  comp: Competencia,
  estado: StatusFolha,
  opts: { historico?: EventoFolha[]; arquivo?: ArquivoFolha; prazo?: string } = {}
): TarefaSaida {
  const ref = mesAno(comp);
  return {
    id: `folha-${comp}`,
    categoria: 'saida',
    subtipo: 'folha-pagamento',
    titulo: `Folha de pagamento — ${ref}`,
    descricao: `Folha de pagamento — ${ref}`,
    competencia: comp,
    prazo: opts.prazo ?? `${comp}-25`,
    // 'status' não é usado para folha (segue 'statusFolha'); valor neutro.
    status: 'nao-iniciada',
    statusFolha: estado,
    arquivoFolha: opts.arquivo,
    historicoFolha: opts.historico ?? [],
  };
}

/** Folha aprovada de um mês passado, com histórico no cenário indicado. */
function folhaPassada(comp: Competencia, cenario: CenarioFolha): TarefaSaida {
  return folhaPagamento(comp, 'aprovado', {
    historico: historicoFolhaAprovada(comp, cenario),
    arquivo: { nome: `folha-pagamento-${comp}-final.pdf`, legenda: 'Versão final aprovada' },
  });
}

// Folha aprovada para cada mês passado, alternando os cenários de troca
// (direta / uma-volta / duas-voltas) para variar os históricos.
const CENARIOS_FOLHA: CenarioFolha[] = ['direta', 'uma-volta', 'duas-voltas'];
const folhasPassadas: TarefaSaida[] = MESES_PASSADOS.map((c, i) =>
  folhaPassada(c, CENARIOS_FOLHA[i % CENARIOS_FOLHA.length])
);

// Mês atual (02/2026): a BHub enviou a 1ª versão em 12/02 e aguarda aprovação.
const folhaAtual: TarefaSaida = folhaPagamento(COMPETENCIA_ATUAL, 'aguardando-aprovacao', {
  prazo: '2026-02-25',
  arquivo: {
    nome: 'folha-pagamento-2026-02-v1.pdf',
    legenda: 'Versão 1 · enviada para aprovação',
  },
  historico: [
    evVersao(
      COMPETENCIA_ATUAL,
      '12',
      1,
      'Disponibilizamos a folha de pagamento de fevereiro para sua conferência. ' +
        'Revise os valores e aprove ou solicite ajustes até o dia 25.'
    ),
  ],
});

// Meses futuros: ainda em processamento, disponível até o fim do mês.
const folhasFuturas: TarefaSaida[] = MESES_FUTUROS.map((c) =>
  folhaPagamento(c, 'em-processamento', { prazo: `${c}-27` })
);

// --- Fechamento contábil (entregável) ---
// Painel pelo qual o cliente acompanha o fechamento do mês e resolve o que
// depende dele. Na competência atual há 2 movimentações não identificadas
// (status 'acao-necessaria'); meses passados aparecem concluídos.

// Histórico compartilhado por todas as tarefas de fechamento (mock). Mistura os
// três desfechos possíveis para ilustrar a tabela de competências anteriores.
const historicoFechamentos: FechamentoHistorico[] = [
  { competencia: '2026-01', fechadoEm: '2026-01-31', origem: 'normal' },
  { competencia: '2025-12', fechadoEm: '2025-12-30', origem: 'via-caixa' },
  { competencia: '2025-11', fechadoEm: '2025-12-01', origem: 'com-pendencias' },
  { competencia: '2025-10', fechadoEm: '2025-10-31', origem: 'normal' },
  { competencia: '2025-09', fechadoEm: '2025-09-30', origem: 'normal' },
];

// Fechamento de uma competência passada: concluído, sem pendências.
function fechamentoConcluido(comp: Competencia): TarefaFechamento {
  const ref = refMesAno(comp);
  return {
    id: `fech-${comp}`,
    categoria: 'saida',
    subtipo: 'fechamento-contabil',
    titulo: `Fechamento contábil de ${ref}`,
    descricao: 'Acompanhe o andamento do fechamento do mês.',
    competencia: comp,
    prazo: `${comp}-28`,
    status: 'concluido',
    origem: 'normal',
    fechadoEm: `${comp}-28`,
    etapas: [
      { chave: 'notas', rotulo: 'Notas fiscais', status: 'ok', detalhe: 'Todas as notas foram processadas' },
      { chave: 'extrato', rotulo: 'Extrato bancário', status: 'ok', detalhe: 'Recebido via Open Finance' },
      { chave: 'impostos', rotulo: 'Impostos', status: 'ok', detalhe: 'Apurados e disponíveis nas guias' },
      { chave: 'fechamento', rotulo: 'Fechamento', status: 'ok', detalhe: 'Concluído' },
    ],
    movimentacoes: [],
    notasDisponiveis: [],
    historico: historicoFechamentos,
  };
}

// Fechamento via caixa (PGTOWEB): não recebemos o extrato do mês, então o
// período foi fechado só com base nos comprovantes de pagamento de tributos.
function fechamentoViaCaixa(comp: Competencia): TarefaFechamento {
  const ref = refMesAno(comp);
  return {
    id: `fech-${comp}`,
    categoria: 'saida',
    subtipo: 'fechamento-contabil',
    titulo: `Fechamento contábil de ${ref}`,
    descricao: 'Acompanhe o andamento do fechamento do mês.',
    competencia: comp,
    prazo: `${comp}-28`,
    status: 'concluido',
    origem: 'via-caixa',
    fechadoEm: `${comp}-28`,
    etapas: [
      { chave: 'notas', rotulo: 'Notas fiscais', status: 'ok', detalhe: 'Todas as notas foram processadas' },
      {
        chave: 'extrato',
        rotulo: 'Extrato bancário',
        status: 'atencao',
        detalhe: 'Não recebido — fechado pelos comprovantes de tributos',
      },
      { chave: 'impostos', rotulo: 'Impostos', status: 'ok', detalhe: 'Apurados pelos comprovantes de pagamento' },
      { chave: 'fechamento', rotulo: 'Fechamento', status: 'ok', detalhe: 'Concluído via caixa' },
    ],
    movimentacoes: [],
    notasDisponiveis: [],
    historico: historicoFechamentos,
  };
}

// Fechamento concluído, porém com movimentações que o cliente não esclareceu a
// tempo e ficaram em aberto na competência.
function fechamentoComPendencias(comp: Competencia): TarefaFechamento {
  const ref = refMesAno(comp);
  return {
    id: `fech-${comp}`,
    categoria: 'saida',
    subtipo: 'fechamento-contabil',
    titulo: `Fechamento contábil de ${ref}`,
    descricao: 'Acompanhe o andamento do fechamento do mês.',
    competencia: comp,
    prazo: `${comp}-28`,
    status: 'concluido',
    origem: 'com-pendencias',
    fechadoEm: `${comp}-28`,
    etapas: [
      { chave: 'notas', rotulo: 'Notas fiscais', status: 'ok', detalhe: 'Todas as notas foram processadas' },
      { chave: 'extrato', rotulo: 'Extrato bancário', status: 'ok', detalhe: 'Recebido via Open Finance' },
      { chave: 'impostos', rotulo: 'Impostos', status: 'ok', detalhe: 'Apurados e disponíveis nas guias' },
      {
        chave: 'fechamento',
        rotulo: 'Fechamento',
        status: 'atencao',
        detalhe: 'Concluído com 1 movimentação em aberto',
      },
    ],
    movimentacoes: [],
    notasDisponiveis: [],
    historico: historicoFechamentos,
  };
}

// Competência atual (02/2026): notas e extrato ok, impostos em apuração e o
// fechamento aguardando o cliente confirmar 2 movimentações não identificadas.
const fechamentoAtual: TarefaFechamento = {
  id: 'fech-2026-02',
  categoria: 'saida',
  subtipo: 'fechamento-contabil',
  titulo: 'Fechamento contábil de Janeiro 2026',
  descricao: 'Acompanhe o andamento do fechamento e resolva o que depende de você.',
  competencia: COMPETENCIA_ATUAL,
  prazo: '2026-02-28',
  status: 'acao-necessaria',
  etapas: [
    { chave: 'notas', rotulo: 'Notas fiscais', status: 'ok', detalhe: 'Todas as notas foram processadas' },
    { chave: 'extrato', rotulo: 'Extrato bancário', status: 'ok', detalhe: 'Recebido via Open Finance' },
    { chave: 'impostos', rotulo: 'Impostos', status: 'processando', detalhe: 'Em apuração pela nossa equipe' },
    {
      chave: 'fechamento',
      rotulo: 'Fechamento',
      status: 'pendente',
      detalhe: 'Aguardando você confirmar 2 movimentações',
    },
  ],
  movimentacoes: [
    {
      id: 'mov-1',
      data: '2026-01-15',
      valor: 5800,
      tipo: 'recebimento',
      descricaoExtrato: 'TED RECEBIDA - JOAO DA SILVA',
      contraparte: 'João da Silva',
      prazo: '2026-02-19',
    },
    {
      id: 'mov-2',
      data: '2026-01-20',
      valor: 1200,
      tipo: 'pagamento',
      descricaoExtrato: 'COMPRA CARTAO - POSTO LTDA',
      contraparte: 'Posto Ltda',
      prazo: '2026-02-19',
    },
  ],
  notasDisponiveis: [
    { id: 'nf-4521', rotulo: 'NF 4521 — XPTO Comércio — R$ 5.800,00' },
    { id: 'nf-4522', rotulo: 'NF 4522 — ACME Serviços — R$ 2.300,00' },
    { id: 'nf-4519', rotulo: 'NF 4519 — BetaMix Ltda — R$ 980,00' },
  ],
  historico: historicoFechamentos,
};

// Fechamento de uma competência futura: ainda não começou, tudo em
// processamento conforme as datas do mês. Sem pendências para o cliente —
// no painel vira um empty state de acompanhamento.
function fechamentoEmAndamento(comp: Competencia): TarefaFechamento {
  const ref = refMesAno(comp);
  return {
    id: `fech-${comp}`,
    categoria: 'saida',
    subtipo: 'fechamento-contabil',
    titulo: `Fechamento contábil de ${ref}`,
    descricao: 'Acompanhe o andamento do fechamento do mês.',
    competencia: comp,
    prazo: `${comp}-28`,
    status: 'em-andamento',
    etapas: [
      { chave: 'notas', rotulo: 'Notas fiscais', status: 'processando', detalhe: 'Aguardando o fim do mês' },
      { chave: 'extrato', rotulo: 'Extrato bancário', status: 'processando', detalhe: 'Captura automática em andamento' },
      { chave: 'impostos', rotulo: 'Impostos', status: 'processando', detalhe: 'Serão apurados após o fechamento' },
      {
        chave: 'fechamento',
        rotulo: 'Fechamento',
        status: 'processando',
        detalhe: 'Começa assim que recebermos os dados do mês',
      },
    ],
    movimentacoes: [],
    notasDisponiveis: [],
    historico: historicoFechamentos,
  };
}

// Meses passados: a maioria concluída normalmente, mas dois casos curados para
// ilustrar os desfechos especiais — dez/2025 via caixa e nov/2025 com pendências.
const fechamentosPassados = MESES_PASSADOS.map((c) => {
  if (c === '2025-12') return fechamentoViaCaixa(c);
  if (c === '2025-11') return fechamentoComPendencias(c);
  return fechamentoConcluido(c);
});

export const tarefasFechamento: TarefaFechamento[] = [
  ...fechamentosPassados,
  fechamentoAtual,
  ...MESES_FUTUROS.map((c) => fechamentoEmAndamento(c)),
];

// --- Meses de demonstração de volume (paginação "Ver mais") ---
// Dois meses passados (dez/2025 e jan/2026) recebem um volume realista de
// tarefas e entregáveis, além dos recorrentes, para que o limite de 6 itens por
// bloco e o botão "Ver mais" da Home fiquem visíveis no protótipo. Como são
// meses já encerrados, o status segue derivado em runtime (prazo + arquivos):
// quem foi enviado fica verde; quem não foi, vermelho (atrasada).
const MESES_DEMO_VOLUME: Competencia[] = ['2025-12', '2026-01'];

type ModeloEntradaDemo = {
  chave: string;
  tipo: TipoEntrada;
  titulo: string;
  descricao: (mes: string) => string;
  dia: string;
  /** true → enviada no prazo (verde); false → ficou sem envio (vermelho). */
  enviada: boolean;
};

// 11 tarefas de entrada extras — somadas às 2 recorrentes, dão 13 no bloco.
const ENTRADAS_DEMO: ModeloEntradaDemo[] = [
  { chave: 'notas-compra', tipo: 'notas', titulo: 'Enviar notas fiscais de compra', descricao: (m) => `Envie as notas fiscais de compra de ${m}`, dia: '06', enviada: true },
  { chave: 'faturamento', tipo: 'fechamento', titulo: 'Confirmar faturamento do mês', descricao: (m) => `Confirme o faturamento de ${m} para a apuração dos impostos`, dia: '07', enviada: true },
  { chave: 'despesas', tipo: 'fechamento', titulo: 'Enviar comprovantes de despesas', descricao: (m) => `Envie os comprovantes de despesas de ${m}`, dia: '08', enviada: true },
  { chave: 'prolabore', tipo: 'fechamento', titulo: 'Enviar recibos de pró-labore', descricao: (m) => `Envie os recibos de pró-labore de ${m}`, dia: '09', enviada: true },
  { chave: 'caixa', tipo: 'fechamento', titulo: 'Informar movimentações de caixa', descricao: (m) => `Informe as movimentações de caixa de ${m}`, dia: '11', enviada: true },
  { chave: 'contratos', tipo: 'fechamento', titulo: 'Enviar contratos de prestação de serviço', descricao: (m) => `Envie os contratos firmados em ${m}`, dia: '12', enviada: false },
  { chave: 'tributos', tipo: 'fechamento', titulo: 'Enviar comprovantes de pagamento de tributos', descricao: (m) => `Envie os comprovantes de tributos pagos em ${m}`, dia: '14', enviada: true },
  { chave: 'funcionarios', tipo: 'fechamento', titulo: 'Confirmar quadro de funcionários', descricao: (m) => `Confirme o quadro de funcionários de ${m}`, dia: '15', enviada: true },
  { chave: 'fornecedores', tipo: 'fechamento', titulo: 'Enviar relação de fornecedores', descricao: (m) => `Envie a relação de fornecedores pagos em ${m}`, dia: '18', enviada: true },
  { chave: 'estoque', tipo: 'fechamento', titulo: 'Confirmar estoque do período', descricao: (m) => `Confirme o estoque ao fim de ${m}`, dia: '22', enviada: false },
  { chave: 'cartao', tipo: 'fechamento', titulo: 'Enviar faturas de cartão corporativo', descricao: (m) => `Envie as faturas de cartão corporativo de ${m}`, dia: '25', enviada: true },
];

function entradasDemo(comp: Competencia): TarefaEntrada[] {
  const m = refMes(comp);
  return ENTRADAS_DEMO.map((mod) => ({
    id: `ent-${comp}-${mod.chave}`,
    categoria: 'entrada',
    tipo: mod.tipo,
    titulo: mod.titulo,
    descricao: mod.descricao(m),
    competencia: comp,
    prazo: `${comp}-${mod.dia}`,
    automacao: 'nao-elegivel',
    arquivos: mod.enviada ? 1 : 0,
  }));
}

type ModeloGuiaDemo = { chave: string; titulo: string; valor: number; dia: string; mensalidade?: boolean };

// 8 guias extras — somadas às 3 recorrentes + folha + fechamento, dão 13 no bloco.
const GUIAS_DEMO: ModeloGuiaDemo[] = [
  { chave: 'das-simples', titulo: 'DAS — Simples Nacional', valor: 1980.3, dia: '20' },
  { chave: 'inss', titulo: 'INSS — GPS', valor: 845.2, dia: '20' },
  { chave: 'fgts', titulo: 'FGTS — Guia mensal', valor: 410.0, dia: '07' },
  { chave: 'irrf', titulo: 'IRRF sobre a folha', valor: 320.5, dia: '20' },
  { chave: 'irpj', titulo: 'IRPJ — Estimativa', valor: 1290.0, dia: '28' },
  { chave: 'csll', titulo: 'CSLL — Estimativa', valor: 760.0, dia: '28' },
  { chave: 'icms', titulo: 'ICMS — Apuração', valor: 2150.75, dia: '15' },
  { chave: 'mensalidade', titulo: 'Mensalidade BHub', valor: 499.0, dia: '05', mensalidade: true },
];

function guiasDemo(comp: Competencia): TarefaSaida[] {
  const ref = refMesAno(comp);
  return GUIAS_DEMO.map((mod) => ({
    id: `sai-${comp}-${mod.chave}`,
    categoria: 'saida',
    subtipo: mod.mensalidade ? 'mensalidade-bhub' : 'guia-imposto',
    titulo: `${mod.titulo} — ${ref}`,
    descricao: `${mod.titulo} — ${ref}`,
    competencia: comp,
    prazo: `${comp}-${mod.dia}`,
    valor: mod.valor,
    status: 'nao-iniciada',
    linhaDigitavel: '85800000006-1 12404000019-8 80000123456-7 89012345678-9',
  }));
}

// Tarefa cancelada (nov/2025): demonstra o estado "Cancelada" — card atenuado,
// badge cinza e posicionada no fim da lista (depois das concluídas).
const entradaCancelada: TarefaEntrada = {
  id: 'ent-2025-11-cancelada',
  categoria: 'entrada',
  tipo: 'notas',
  titulo: 'Enviar declaração de serviços',
  descricao: 'Cancelada pela contabilidade — não é mais necessária neste mês',
  competencia: '2025-11',
  prazo: '2025-11-20',
  automacao: 'nao-elegivel',
  arquivos: 0,
  cancelada: true,
};

export const tarefasEntrada: TarefaEntrada[] = [
  ...MESES_PASSADOS.flatMap((c) => [
    ...entradasRecorrentes(c, 'passado'),
    ...(MESES_DEMO_VOLUME.includes(c) ? entradasDemo(c) : []),
  ]),
  entradaCancelada,
  ...entradasAtual,
  ...MESES_FUTUROS.flatMap((c) => entradasRecorrentes(c, 'futuro')),
];

export const tarefasSaida: TarefaSaida[] = [
  ...MESES_PASSADOS.flatMap((c) => [
    ...guiasRecorrentes(c),
    ...(MESES_DEMO_VOLUME.includes(c) ? guiasDemo(c) : []),
  ]),
  ...folhasPassadas,
  ...guiasAtual,
  folhaAtual,
  ...MESES_FUTUROS.flatMap((c) => guiasRecorrentes(c)),
  ...folhasFuturas,
];
