import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CreateDebateFormComponent } from './components/debates/components/create-debate-form/create-debate-form.component';
import { CreateMemberFormComponent } from './components/members/components/create-member-form/create-member-form.component';
import { MembersComponent } from './components/members/members.component';
import { DebatesTableComponent } from './components/debates/components/debates-table/debates-table.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CreateDebateModalComponent } from './components/debates/components/create-debate-modal/create-debate-modal.component';
import { MembersTableComponent } from './components/members/components/members-table/members-table.component';
import { CreateMemberModalComponent } from './components/members/components/create-member-modal/create-member-modal.component';
import { SpinnerComponent } from './utils/components/spinner/spinner.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { ConfirmModalComponent } from './components/members/components/confirm-modal/confirm-modal.component';
import { GoalsComponent } from './components/goals/goals.component';
import { NewsComponent } from './components/news/news.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

registerLocaleData(pt);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    DebatesComponent,
    NavbarComponent,
    CreateDebateFormComponent,
    CreateMemberFormComponent,
    MembersComponent,
    DebatesTableComponent,
    CreateDebateModalComponent,
    MembersTableComponent,
    CreateMemberModalComponent,
    SpinnerComponent,
    LandingPageComponent,
    ConfirmModalComponent,
    GoalsComponent,
    NewsComponent,
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
    MatDialogModule,
    MatProgressBarModule,
    NzAvatarModule,
    NzIconModule,
    NzToolTipModule
  ],
  exports: [
    NgxSpinnerModule
  ],
  providers: [
    LoginGuard,
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {
      appearance: 'outline',
      subscriptSizing: 'dynamic'
    }}
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
