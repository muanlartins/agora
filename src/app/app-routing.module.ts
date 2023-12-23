import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DebatesComponent } from './components/debates/debates.component';
import { LoginGuard } from './guards/login.guard';
import { JudgesComponent } from './components/judges/judges.component';
import { DebatersComponent } from './components/debaters/debaters.component';
import { DuosComponent } from './components/duos/duos.component';
import { GraphsComponent } from './components/graphs/graphs.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: "full" },
  { path: 'login', component: LoginComponent, data: {} },
  { path: 'dashboard', component: DashboardComponent, canActivate: [LoginGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [LoginGuard] },
  { path: 'debates', component: DebatesComponent, canActivate: [LoginGuard] },
  { path: 'judges', component: JudgesComponent, canActivate: [LoginGuard] },
  { path: 'debaters', component: DebatersComponent, canActivate: [LoginGuard] },
  { path: 'duos', component: DuosComponent, canActivate: [LoginGuard] },
  { path: 'graphs', component: GraphsComponent, canActivate: [LoginGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
