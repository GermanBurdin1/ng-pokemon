import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, map, of, shareReplay, skip, skipWhile, switchMap, tap } from 'rxjs';
import { AllPokemons, Pokemon, StatePokemons } from '../models';
import { HttpPokemonService } from './http-pokemon.service';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private readonly _statePokemons: BehaviorSubject<StatePokemons> = new BehaviorSubject<StatePokemons>({
    nextUrl: null,
    previousUrl: null,
    pokemonsObj: {}
  });
  public pokemons$: Observable<Pokemon[]> = this._statePokemons.pipe(
    map(statePokemons => Object.values(statePokemons.pokemonsObj)),
    shareReplay(1)
  );

  constructor(
    private readonly _httpPokemonService: HttpPokemonService
  ) {
    const subs = this._getAll().subscribe(() => {
      subs.unsubscribe();
    });

    (window as any).pokemonService = this;
  }

  public getById(id: number): Observable<Pokemon | null> {
    return this._statePokemons.pipe(
      skipWhile(statePokemons => {
        const countPokemons = Object.keys(statePokemons.pokemonsObj).length;

        return countPokemons === 0.
      }),
      map(() => {
        return this.syncGetById(id);
      })
    );
  }

  public syncGetById(id: number): Pokemon | null {
    const pokemon = this._statePokemons.value.pokemonsObj[id];

    if (pokemon === undefined) return null;

    return pokemon;
  }

  public getNextAll(): Observable<AllPokemons | null> {
    const nextUrl = this._statePokemons.value.nextUrl;
    if (nextUrl === null) return of(null);
    const pokemonsNextAll$ = this._httpPokemonService.getNextAll(nextUrl);

    return this._processAllPokemons(pokemonsNextAll$);
  }

  private _getAll(): Observable<AllPokemons> {
    const pokemonsAll$ = this._httpPokemonService.getAll();

    return this._processAllPokemons(pokemonsAll$);
  }

  private _processAllPokemons(pokemons$: Observable<AllPokemons>): Observable<AllPokemons> {
    return pokemons$.pipe(
      switchMap(allPokemons => {
        // Создаем массив HTTP запросов для каждого URL покемона
        const requests = allPokemons.results.map(pokemon => this._httpPokemonService.getOne(pokemon.url));
        // Используем forkJoin для выполнения всех запросов параллельно
        return forkJoin(requests).pipe(
          tap(pokemonDetails => {
            this._statePokemons.next({
              nextUrl: allPokemons.next,
              previousUrl: allPokemons.previous,
              pokemonsObj: {
                ...this._statePokemons.value.pokemonsObj,
                ...this._formatPokemonsToRecord(pokemonDetails),
              }
            });
          }),
          map(() => {
            return allPokemons;
          })
        );
      })
    );
  }

  private _formatPokemonsToRecord(pokemons: Pokemon[]): Record<number, Pokemon> {
    return pokemons.reduce((acc, pokemon) => {
      acc[pokemon.id] = pokemon;
      return acc;
    }, {} as Record<number, Pokemon>);
  }

}
