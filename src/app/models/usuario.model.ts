// path: src/app/models/usuario.model.ts
export interface Usuario {
  id?: number;
  username: string;
  nome: string;
  email: string;
  telefone?: string;
  roles: string[];
  enabled: boolean;
}

export interface UsuarioRequest {
  username: string;
  password?: string; // obrigatório no create, opcional no update
  nome: string;
  email: string;
  telefone?: string;
  roles: string[];
  enabled: boolean;
}

export interface UsuarioSummary {
  id: number;
  username: string;
  nome: string;
  email: string;
  telefone?: string;
  enabled: boolean;
}
