export interface Show {
  id: number;
  contratanteId: number;
  contratanteNome: string;
  contratanteTelefone?: string;
  localId: number;
  localNome: string;
  localEndereco?: string;
  data: string;
  hora: string;
  duracao: string;
  valorCobrado: number;
  pago: boolean;
  dataPagamento?: string;
  formaPagamento: string;
  estilosSolicitados: string[];
  necessitaNotaFiscal: boolean;
  notaEmitida: boolean;
  createdAt: string;
}

export interface ShowFormData {
  contratanteId: number | null;
  contratanteNome: string;
  contratanteTelefone?: string;
  localId: number | null;
  localNome: string;
  localEndereco?: string;
  data: string;
  hora: string;
  duracao: string;
  valorCobrado: number | null;
  pago: boolean;
  dataPagamento: string;
  formaPagamento: string;
  necessitaNotaFiscal: boolean;
  notaEmitida: boolean;
}

export const FORMAS_PAGAMENTO = [
  'Pix',
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto',
  'Transferência Bancária',
  'Doação',
  'Outro',
];

export const ESTILOS_MUSICAIS = [
  'MPB',
  'Pop-Rock',
  'Rock',
  'Sertanejo',
  'Forró',
  'Rock Internacional',
  'Outro',
];
