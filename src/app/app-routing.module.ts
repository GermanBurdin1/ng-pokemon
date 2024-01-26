import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutMainComponent } from './layouts/layout-main/layout-main.component';
import { LayoutErrorComponent } from './layouts/layout-error/layout-error.component';
import { PokemonTableComponent } from './components/pokemon-table/pokemon-table.component';
import { PokemonDetailsComponent } from './components/pokemon-details/pokemon-details.component';


export const routes: Routes = [
  { path: '', redirectTo: 'pokemons', pathMatch: 'full' },
  { path: 'pokemons', component: LayoutMainComponent, children: [
    { path: '', component: PokemonTableComponent },
    { path: ':id', component: PokemonDetailsComponent  }
  ] },
  { path: '**', component: LayoutErrorComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
