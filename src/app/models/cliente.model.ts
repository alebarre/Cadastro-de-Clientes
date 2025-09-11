export interface Endereco {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  uf: string;
}

export interface Modalidade {
  id: number;
  nome: string;
  descricao?: string;
  valor: number;
}

/** Usado na listagem */
export interface ClienteSummary {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  enderecosResumo: string;        // novo padrão
  quantidadeModalidades: number;
  // LEGADO (opcional): alguns backends antigos podem mandar isto:
  cidades?: string[];             // compat: usado só como fallback
}

/** Usado no card e no formulário (detalhe) */
export interface ClienteCard {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  enderecos: Endereco[];
  modalidades: Modalidade[];
}

/** Alias para manter compatibilidade: o "Cliente" completo é igual ao detalhe */
export type Cliente = ClienteCard;

/** Payload que o backend espera em create/update (ajuste se seu back usar outro formato) */
export interface ClienteRequest {
  nome: string;
  email: string;
  telefone: string;
  enderecos: Endereco[];
  modalidadesIds: number[]; // enviamos apenas os IDs das modalidades
}
