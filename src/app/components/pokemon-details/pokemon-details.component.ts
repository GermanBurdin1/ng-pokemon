import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { Pokemon } from '../../models';

@Component({
  selector: 'app-pokemon-details',
  templateUrl: './pokemon-details.component.html',
  styleUrls: ['./pokemon-details.component.scss']
})
export class PokemonDetailsComponent {
  private _id$: Observable<string> = this._route.params.pipe(
    map(params => params['id']),
    tap(id => {
      if (id === undefined) {
        this._router.navigateByUrl('/pokemons');
        return;
      }
    }),
    map(id => id as string)
  );

  public pokemon$: Observable<{
    item: Pokemon | null;
  }> = this._id$.pipe(
    switchMap(id => {
      return this._pokemonService.getById(Number(id));
    }),
    map(pokemon => ({ item: pokemon }))
  )

  constructor(
    private readonly _pokemonService: PokemonService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {

  }
}
