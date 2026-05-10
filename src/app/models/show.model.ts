export interface Show {
  id: number;
  contratanteId: number;
  contratanteNome: string;
  localId: number;
  localNome: string;
  data: string;
  hora: string;
  duracao: string;
  valorCobrado: number;
  pago: boolean;
  dataPagamento?: string;
  formaPagamento: string;
  estilosSolicitados: string[];
  createdAt: string;
}

export interface ShowFormData {
  contratanteId: number | null;
  contratanteNome: string;
  localId: number | null;
  localNome: string;
  data: string;
  hora: string;
  duracao: string;
  valorCobrado: number | null;
  pago: boolean;
  dataPagamento: string;
  formaPagamento: string;
}

export const FORMAS_PAGAMENTO = [
  'Pix',
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Cheque',
  'Boleto',
  'Transferência Bancária',
  'Outro',
];

export const ESTILOS_MUSICAIS = [
  'Samba',
  'Pagode',
  'MPB',
  'Pop',
  'Rock',
  'Sertanejo',
  'Funk',
  'Forró',
  'Axé',
  'Bossa Nova',
  'Jazz',
  'Blues',
  'Eletrônica',
  'Gospel',
  'Infantil',
  'Outro',
];
