export type Competencia = `${number}-${string}`;

export type StatusTarefa = 'nao-iniciada' | 'concluida' | 'atrasada';

export type AutomacaoEstado = 'nao-elegivel' | 'elegivel' | 'ativa';

export type CategoriaTarefa = 'entrada' | 'saida';

export interface Operador {
  nome: string;
  avatarUrl?: string;
  iniciais: string;
}

/** Discrimina qual layout interno a tarefa de entrada usa. */
export type TipoEntrada =
  | 'extratos'
  | 'notas'
  | 'fechamento'
  | 'rejeitados'
  | 'documentacao-pendente';

/** Conta financeira cadastrada pela empresa (usada no envio de extratos). */
export interface ContaFinanceira {
  id: string;
  banco: string;
  /** Ex.: "Conta corrente". */
  tipo: string;
  /** Final/identificação amigável da conta, ex.: "•••• 1234". */
  identificacao: string;
  /**
   * Token do Open Finance expirado — a conta estava automatizada mas perdeu
   * a autorização. Exibe alerta de renovação na ExtratosBody e badge âmbar
   * no modal de gerenciamento.
   */
  tokenExpirado?: boolean;
}

/** Documento enviado pelo cliente que a contabilidade rejeitou. */
export interface DocumentoRejeitado {
  id: string;
  nomeArquivo: string;
  motivo: string;
  rejeitadoEm: string;
  /** Operador da contabilidade que rejeitou o documento (remetente da mensagem). */
  operador?: Operador;
}

/**
 * Solicitação de documento faltante feita pela contabilidade (tipo
 * 'documentacao-pendente'). A operação descreve, em formato de mensagem
 * (como um e-mail), qual documento está faltando para o fechamento.
 */
export interface SolicitacaoDocumento {
  operador: Operador;
  enviadoEm: string;
  assunto: string;
  mensagem: string;
}

/** Tipo de evento no histórico de uma guia. */
export type TipoRegistroGuia = 'download' | 'marcado-como-pago';

/** Registro de download ou marcação de pagamento de uma guia. */
export interface RegistroDownload {
  id: string;
  tipo?: TipoRegistroGuia;
  usuario: string;
  iniciais: string;
  baixadoEm: string;
}

export interface TarefaEntrada {
  id: string;
  categoria: 'entrada';
  tipo: TipoEntrada;
  titulo: string;
  descricao?: string;
  competencia: Competencia;
  prazo: string;
  automacao: AutomacaoEstado;
  operador?: Operador;
  /** Quantidade de arquivos enviados pelo cliente. >0 conclui a tarefa. */
  arquivos: number;
  /** Cliente confirmou que não tem envio neste mês (conclui a tarefa sem arquivos). */
  semEnvio?: boolean;
  /**
   * Tarefa cancelada pela contabilidade — não é mais necessária. O card aparece
   * atenuado, com badge cinza "Cancelada", e vai para o fim da lista. Não entra
   * nas contagens de progresso (nem concluída nem pendente).
   */
  cancelada?: boolean;
  /** Documento rejeitado pela contabilidade (apenas tipo 'rejeitados' — 1 por tarefa). */
  documentoRejeitado?: DocumentoRejeitado;
  /** Solicitação de documento faltante (apenas tipo 'documentacao-pendente'). */
  solicitacao?: SolicitacaoDocumento;
}

export type SubtipoSaida = 'guia-imposto' | 'mensalidade-bhub' | 'folha-pagamento';

/**
 * Status da Folha de pagamento (entregável BHub, subtipo 'folha-pagamento').
 * Diferente das guias, a folha tem um ciclo próprio de aprovação:
 *  - em-processamento:    a BHub ainda está montando a folha (disponível até X).
 *  - aguardando-aprovacao: a BHub enviou uma versão e aguarda o cliente aprovar/rejeitar.
 *  - aprovado:            o cliente aprovou e a BHub disponibilizou o entregável final.
 */
export type StatusFolha = 'em-processamento' | 'aguardando-aprovacao' | 'aprovado';

/** Tipo de evento numa troca da folha entre a BHub e o cliente. */
export type EventoFolhaTipo =
  | 'versao-enviada' // a BHub disponibilizou uma (nova) versão da folha
  | 'rejeicao' // o cliente rejeitou a versão, com observações
  | 'aprovacao' // o cliente aprovou a versão
  | 'comentario'; // mensagem avulsa (cliente ou BHub)

/** Arquivo associado à folha (versão em aprovação, entregável final ou anexo). */
export interface ArquivoFolha {
  nome: string;
  /** Legenda secundária, ex.: "Versão 1 · enviada para aprovação". */
  legenda?: string;
}

/** Um evento no histórico de trocas da folha de pagamento. */
export interface EventoFolha {
  id: string;
  /** Quem registrou o evento. */
  autor: 'bhub' | 'cliente';
  operador: Operador;
  /** Data/hora do evento (ISO). */
  data: string;
  tipo: EventoFolhaTipo;
  /** Mensagem/observação associada (ex.: motivo da rejeição). */
  mensagem?: string;
  /** Arquivo anexado ao evento (ex.: a versão enviada pela BHub). */
  arquivo?: ArquivoFolha;
}

export interface TarefaSaida {
  id: string;
  categoria: 'saida';
  subtipo: SubtipoSaida;
  titulo: string;
  descricao?: string;
  competencia: Competencia;
  prazo?: string;
  valor?: number;
  status: StatusTarefa | 'calculando';
  /** Linha digitável / código de barras da guia (exibido no detalhe). */
  linhaDigitavel?: string;
  /** Histórico de downloads da guia por usuários da empresa. */
  downloads?: RegistroDownload[];
  /**
   * Cliente marcou a guia como paga (controle opcional na UI).
   * Não altera o status operacional da guia na BHub.
   */
  marcadaComoPaga?: boolean;
  /** Status da folha de pagamento (apenas subtipo 'folha-pagamento'). */
  statusFolha?: StatusFolha;
  /**
   * Arquivo da folha disponível para download: a versão em aprovação
   * (statusFolha 'aguardando-aprovacao') ou o entregável final ('aprovado').
   */
  arquivoFolha?: ArquivoFolha;
  /** Histórico de trocas BHub ↔ cliente (apenas subtipo 'folha-pagamento'). */
  historicoFolha?: EventoFolha[];
}

// ---- Fechamento contábil (entregável de saída) ----

/**
 * Status de uma etapa do fechamento, em linguagem de negócio.
 *  - ok:          etapa concluída/sem pendência (verde).
 *  - atencao:     algo aguardando confirmação, mas sem bloqueio (âmbar).
 *  - pendente:    depende de uma ação do cliente para seguir (vermelho).
 *  - processando: a BHub ainda está trabalhando nela (neutro).
 */
export type StatusEtapa = 'ok' | 'atencao' | 'pendente' | 'processando';

/** Uma etapa do fechamento mensal exibida ao cliente no painel. */
export interface EtapaFechamento {
  chave: 'notas' | 'extrato' | 'impostos' | 'fechamento';
  rotulo: string;
  status: StatusEtapa;
  /** Estado em linguagem de negócio. Ex.: "Todas as notas processadas". */
  detalhe: string;
}

/** Nota fiscal do período, oferecida para vincular a uma movimentação. */
export interface NotaFiscalRef {
  id: string;
  rotulo: string;
}

/**
 * Movimentação bancária que o Motor Contábil não conseguiu conciliar e que
 * depende do cliente para ser explicada ("cliente no loop" — Hub 4).
 */
export interface MovimentacaoNaoIdentificada {
  id: string;
  /** Data da movimentação no extrato (ISO). */
  data: string;
  valor: number;
  /** Dinheiro que entrou (recebimento) ou saiu (pagamento) da conta. */
  tipo: 'recebimento' | 'pagamento';
  /** Memo bruto do extrato. Ex.: "TED RECEBIDA - JOAO DA SILVA". */
  descricaoExtrato: string;
  /** Contraparte identificada, quando disponível. */
  contraparte?: string;
  /** Prazo para o cliente responder. */
  prazo?: string;
}

/** Como uma competência anterior foi fechada (histórico). */
export type OrigemFechamento = 'normal' | 'via-caixa' | 'com-pendencias';

export interface FechamentoHistorico {
  competencia: Competencia;
  /** Data em que o razão foi fechado (ISO). */
  fechadoEm: string;
  origem: OrigemFechamento;
}

/** Status geral do fechamento da competência (card + badge do detalhe). */
export type StatusFechamento = 'em-andamento' | 'acao-necessaria' | 'concluido';

/**
 * Entregável "Fechamento contábil": o painel pelo qual o cliente acompanha o
 * andamento do fechamento do mês e resolve o que depende dele. Vive na mesma
 * área das guias (entregáveis da BHub), mas tem forma própria — por isso é uma
 * interface separada, e não um subtipo de TarefaSaida.
 */
export interface TarefaFechamento {
  id: string;
  categoria: 'saida';
  subtipo: 'fechamento-contabil';
  titulo: string;
  descricao?: string;
  competencia: Competencia;
  /** Previsão de conclusão do fechamento (ISO). */
  prazo?: string;
  status: StatusFechamento;
  /** Como o mês foi (ou está sendo) fechado. Define o aviso exibido no painel. */
  origem?: OrigemFechamento;
  /** Data em que o fechamento foi concluído (apenas status 'concluido'). */
  fechadoEm?: string;
  etapas: EtapaFechamento[];
  /** Movimentações não identificadas aguardando resposta do cliente. */
  movimentacoes: MovimentacaoNaoIdentificada[];
  /** Notas fiscais do período, para vincular a uma movimentação. */
  notasDisponiveis: NotaFiscalRef[];
  /** Competências anteriores já fechadas. */
  historico: FechamentoHistorico[];
}

export type Tarefa = TarefaEntrada | TarefaSaida | TarefaFechamento;
