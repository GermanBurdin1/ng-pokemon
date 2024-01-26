import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutMainComponent } from './layouts/layout-main/layout-main.component';
import { LayoutErrorComponent } from './layouts/layout-error/layout-error.component';
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { PokemonDetailsComponent } from "./components/pokemon-details/pokemon-details.component";
import { PokemonTableComponent } from "./components/pokemon-table/pokemon-table.component";
import { TuiButtonModule } from '@taiga-ui/core';

@NgModule({
  declarations: [
    AppComponent,
    LayoutMainComponent,
    LayoutErrorComponent,
    PokemonDetailsComponent,
    PokemonTableComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    TuiRootModule,
    TuiDialogModule,
    TuiAlertModule,
    TuiButtonModule
],
  providers: [{provide: TUI_SANITIZER, useClass: NgDompurifySanitizer}],
  bootstrap: [AppComponent]
})
export class AppModule { }
