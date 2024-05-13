import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DebatesComponent } from './components/debates/debates.component';
import { LoginGuard } from './guards/login.guard';
import { MembersComponent } from './components/members/members.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { GoalsComponent } from './components/goals/goals.component';
import { ArticlesComponent } from './components/articles/articles.component';
import { AdminGuard } from './guards/admin.guard';
import { ReportComponent } from './components/report/report.component';
import { MetadebateComponent } from './components/metadebate/metadebate/metadebate.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: "full" },
  { path: 'metadebate', component: MetadebateComponent },
  { path: 'login', component: LoginComponent, data: {} },
  { path: 'dashboard', component: DashboardComponent, canActivate: [LoginGuard] },
  { path: 'debates', component: DebatesComponent, canActivate: [LoginGuard] },
  { path: 'members', component: MembersComponent, canActivate: [LoginGuard] },
  { path: 'goals', component: GoalsComponent, canActivate: [LoginGuard] },
  { path: 'articles', component: ArticlesComponent, canActivate: [LoginGuard] },
  { path: 'member', component: ReportComponent, canActivate: [LoginGuard, AdminGuard] },
  { path: 'member/:id', component: ReportComponent, canActivate: [LoginGuard, AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
