// path: src/app/models/usuario.model.ts
export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  roles: string[];   // ex.: ['ROLE_USER', 'ROLE_ADMIN']
  ativo: boolean;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha?: string | null; // obrigatório só no create
  roles: string[];
  ativo: boolean;
}

export interface UsuarioSummary {
  id: number;
  nome: string;
  email: string;
  roles: string[];
  ativo: boolean;
}
