import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LogoComponent } from './utils/logo/logo.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxSpinnerModule } from "ngx-spinner";
import { DebatesComponent } from './components/debates/debates.component';
import { LoginGuard } from './guards/login.guard';
import { DebatersComponent } from './components/debaters/debaters.component';
import { JudgesComponent } from './components/judges/judges.component';
import { SidebarComponent } from './utils/sidebar/sidebar.component';
import { TableComponent } from './utils/table/table.component';
import { DatePipe } from '@angular/common';
import { InputComponent } from './utils/input/input.component';
import { ButtonComponent } from './utils/button/button.component';
import { SelectComponent } from './utils/select/select.component';
import { TextareaComponent } from './utils/textarea/textarea.component';
import { DuosComponent } from './components/duos/duos.component';
import { InputSelectComponent } from './utils/input-select/input-select.component';
import { TextareaSelectComponent } from './utils/textarea-select/textarea-select.component';
import { GraphsComponent } from './components/graphs/graphs.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ProfileComponent,
    LogoComponent,
    DebatesComponent,
    DebatersComponent,
    JudgesComponent,
    SidebarComponent,
    TableComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    TextareaComponent,
    DuosComponent,
    InputSelectComponent,
    TextareaSelectComponent,
    GraphsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
  ],
  providers: [LoginGuard, DatePipe],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
