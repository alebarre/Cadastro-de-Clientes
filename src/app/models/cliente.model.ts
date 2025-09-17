export interface Endereco {
  id?: number;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  pais: string;
}

export interface Modalidade {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
}

export interface Cliente {
  id?: number;
  nome: string;
  email: string;
  telefone?: string | null;
  cpf?: string | null;
  dataNascimento?: string | null; // ISO string
  enderecos: Endereco[];
  modalidades?: Modalidade[];
}

/** Payload esperado pelo backend */
export interface ClienteRequest {
  nome: string;
  email: string;
  telefone?: string | null;
  cpf?: string | null;
  dataNascimento?: string | null; // ISO string
  enderecos: Endereco[];
  modalidadeIds: number[];
}

export interface ClienteSummary {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  dataNascimento?: string | null; // ISO string
  enderecosResumo?: string;
  cidades?: string[];
  quantidadeModalidades: number;
}

export interface ClienteCard extends Cliente { }
