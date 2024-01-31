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
	// Этот объект содержит информацию о следующей и предыдущей страницах с покемонами, а также объект pokemonsObj, который представляет собой запись покемонов по их идентификатору.
	// _statePokemons является центральным хранилищем состояния данных о покемонах, и методы сервиса PokemonService взаимодействуют с ним для обновления и получения данных. Это обеспечивает единое место управления данными о покемонах в приложении.
	// то есть данные внутри него, а именно nextUrl, previousUrl, pokemonsObj меняются под воздействием методов в классе
  public pokemons$: Observable<Pokemon[]> = this._statePokemons.pipe(
    map(statePokemons => Object.values(statePokemons.pokemonsObj)),
    shareReplay(1)
  );
	// pokemons$ представляет собой поток данных, который излучает массив покемонов на основе текущего состояния _statePokemons, и это значение кэшируется, чтобы избежать повторного выполнения вычислений при каждой подписке.

  constructor(
    private readonly _httpPokemonService: HttpPokemonService
  ) {
		//выполняется код _getAll, получаются все данные;  они дальше идут на обработку и сохранение в центральном хранилище состояния _statePokemons. В коде конструктора PokemonService, подписка на результат выполнения метода _getAll() происходит после выполнения всей логики внутри метода _getAll(). По сути, подписка на subs выполняется после того, как все данные о покемонах были успешно получены с сервера, обработаны и сохранены в _statePokemons.
    const subs = this._getAll().subscribe(() => {
      subs.unsubscribe();
    });

    (window as any).pokemonService = this;
  }

  public getById(id: number): Observable<Pokemon | null> {
    return this._statePokemons.pipe(
      skipWhile(statePokemons => {
        const countPokemons = Object.keys(statePokemons.pokemonsObj).length;

        return countPokemons === 0;
      }),
      map(() => {
        return this.syncGetById(id);
      })
    );
  }
//используется для получения информации о покемоне по его идентификатору (id). Используется в pokemon-details

  public syncGetById(id: number): Pokemon | null {
    const pokemon = this._statePokemons.value.pokemonsObj[id];

    if (pokemon === undefined) return null;

    return pokemon;
  }
//используется для получения информации о покемоне по его идентификатору (id)

  public getNextAll(): Observable<AllPokemons | null> {
    const nextUrl = this._statePokemons.value.nextUrl;
    if (nextUrl === null) return of(null);
    const pokemonsNextAll$ = this._httpPokemonService.getNextAll(nextUrl);

    return this._processAllPokemons(pokemonsNextAll$);
  }
	// выполняет загрузку следующей порции из 10 данных о покемонах с сервера, используя URL, который хранится в текущем состоянии _statePokemons используя метод _processAllPokemons ниже.
	//Используется в свою очередь в методе clickShowMore в table.components.

  private _getAll(): Observable<AllPokemons> {
    const pokemonsAll$ = this._httpPokemonService.getAll();

    return this._processAllPokemons(pokemonsAll$);
  }
	// выполняет загрузку всех доступных данных о покемонах с сервера из httpPokemonService.

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
// код обрабатывает первоначальные данные о покемонах, получая более детальную информацию о каждом из них, обновляет глобальное состояние покемонов в сервисе и возвращает исходный объект данных.

  private _formatPokemonsToRecord(pokemons: Pokemon[]): Record<number, Pokemon> {
    return pokemons.reduce((acc, pokemon) => {
      acc[pokemon.id] = pokemon;
      return acc;
    }, {} as Record<number, Pokemon>);
  }

}
