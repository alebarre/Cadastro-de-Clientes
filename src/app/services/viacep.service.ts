import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;
  erro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ViaCepService {
  constructor(private http: HttpClient) {}

  /** Busca CEP no ViaCEP. Aceita com/sem hífen. */
  find(cep: string) {
    const digits = (cep || '').replace(/\D/g, '');
    if (digits.length !== 8) return of<ViaCepResponse | null>(null);

    return this.http
      .get<ViaCepResponse>(`https://viacep.com.br/ws/${digits}/json/`)
      .pipe(
        map((res) => (res?.erro ? null : res)),
        catchError(() => of(null))
      );
  }

  /** Formata para 99999-999 */
  format(cep: string) {
    const d = (cep || '').replace(/\D/g, '').slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  }
}
