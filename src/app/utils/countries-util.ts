import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Country {
  value: number;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountriesUtil {
  constructor(private http: HttpClient) { }

  getCountries(): Observable<Country[]> {
    return this.http.get<any[]>('https://servicodados.ibge.gov.br/api/v1/localidades/paises')
      .pipe(
        map(data => data.map(country => ({
          value: country.id,
          label: country.nome
        })))
      );
  }

  // Optional: Get countries with error handling
  getCountriesWithErrorHandling(): Observable<Country[]> {
    return this.http.get<any[]>('https://servicodados.ibge.gov.br/api/v1/localidades/paises')
      .pipe(
        map(data => {
          if (!data) {
            throw new Error('No data received');
          }
          return data.map(country => ({
            value: country.id,
            label: country.nome
          }));
        })
      );
  }
}
