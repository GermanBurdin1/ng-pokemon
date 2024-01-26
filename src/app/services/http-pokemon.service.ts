import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AllPokemons, Pokemon } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HttpPokemonService {
  private readonly _baseUrl: string = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private readonly _http: HttpClient) {}

  public getAll(): Observable<AllPokemons> {
    return this._http.get<AllPokemons>(`${this._baseUrl}?limit=10&offset=0`);
  }

  public getNextAll(url: string) {
    return this._http.get<AllPokemons>(url);
  }

  public getOne(url: string): Observable<Pokemon> {
    return this._http.get<Pokemon>(url);
  }
}
