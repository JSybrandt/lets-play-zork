import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpComponent } from './help/help.component';
import { GameComponent } from './game/game.component';

const routes: Routes = [
    { path: '', redirectTo: '/game', pathMatch: 'full' },
    { path: 'game', component: GameComponent },
    { path: 'help', component: HelpComponent }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
