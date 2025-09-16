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
  enderecos: Endereco[];
  modalidades?: Modalidade[]; // usado no card e para montar modalidadeIds no toRequest
}

/** Payload esperado pelo backend */
export interface ClienteRequest {
  nome: string;
  email: string;
  telefone?: string | null;
  cpf?: string | null;
  enderecos: Endereco[];
  modalidadeIds: number[]; // << chave correta
}

export interface ClienteSummary {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  enderecosResumo?: string; // preenchido no service
  cidades?: string[];       // caso venha do back
  quantidadeModalidades: number;
}

export interface ClienteCard extends Cliente { }
