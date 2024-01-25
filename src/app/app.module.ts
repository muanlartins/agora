import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxSpinnerModule } from "ngx-spinner";
import { DebatesComponent } from './components/debates/debates.component';
import { LoginGuard } from './guards/login.guard';
import { DatePipe } from '@angular/common';
import { LogoComponent } from './utils/components/logo/logo.component';
import { NavbarComponent } from './utils/components/navbar/navbar.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateDebateFormComponent } from './components/debates/components/create-debate-form/create-debate-form.component';
import { CreateMemberFormComponent } from './components/members/components/create-member-form/create-member-form.component';
import { MembersComponent } from './components/members/members.component';
import { DebatesTableComponent } from './components/debates/components/debates-table/debates-table.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CreateDebateModalComponent } from './components/debates/components/create-debate-modal/create-debate-modal.component';
import { MembersTableComponent } from './components/members/components/members-table/members-table.component';
import { CreateMemberModalComponent } from './components/members/components/create-member-modal/create-member-modal.component';
import { SpinnerComponent } from './utils/components/spinner/spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    DebatesComponent,
    LogoComponent,
    NavbarComponent,
    CreateDebateFormComponent,
    CreateMemberFormComponent,
    MembersComponent,
    DebatesTableComponent,
    CreateDebateModalComponent,
    MembersTableComponent,
    CreateMemberModalComponent,
    SpinnerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatStepperModule,
    MatCheckboxModule,
    DragDropModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTabsModule,
    MatDialogModule
  ],
  exports: [
    NgxSpinnerModule
  ],
  providers: [
    LoginGuard,
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'fill'}}
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
