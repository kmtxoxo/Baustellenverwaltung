import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './pages/login/login.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UsersComponent } from './pages/users/users.component';
import { ConstructionSiteComponent } from './pages/construction-site/construction-site.component';
import { ConstructionSiteDetailsComponent } from './pages/construction-site-details/construction-site-details.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeaderComponent } from './components/header/header.component';
import { NoteDialogComponent } from './components/note-dialog/note-dialog.component';
import { TaskDialogComponent } from './components/task-dialog/task-dialog.component';
import { WorktimeDialogComponent } from './components/worktime-dialog/worktime-dialog.component';
import { UserDialogComponent } from './components/user-dialog/user-dialog.component';
import { MaterialDialogComponent } from './components/material-dialog/material-dialog.component';
import { ConstructionSiteDialogComponent } from './components/construction-site-dialog/construction-site-dialog.component';
import { MaterialTabComponent } from './pages/construction-site-details/tabs/material-tab/material-tab.component';
import { WorktimeTabComponent } from './pages/construction-site-details/tabs/worktime-tab/worktime-tab.component';
import { GalleryTabComponent } from './pages/construction-site-details/tabs/gallery-tab/gallery-tab.component';
import { DetailsTabComponent } from './pages/construction-site-details/tabs/details-tab/details-tab.component';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatListModule } from '@angular/material/list';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


import { TranslateModule, TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { LayoutService } from './services/layout.service';
import { SidenavService } from './services/sidenav.service';
import {  TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TimestampPipe } from './helper/timestamp.pipe';
import { ImageDialogComponent } from './components/image-dialog/image-dialog.component';
import { AuthInterceptor } from './auth-interceptor';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { TaskTabComponent } from './pages/construction-site-details/tabs/task-tab/task-tab.component';
import { NoteTabComponent } from './pages/construction-site-details/tabs/note-tab/note-tab.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { MatSortModule } from '@angular/material/sort';
// tslint:disable-next-line: max-line-length
import { ConstructionSiteDownloadDialogComponent } from './components/construction-site-download-dialog/construction-site-download-dialog.component';
import { ExportWorktimeDialogComponent } from './components/export-worktime-dialog/export-worktime-dialog.component';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}
export class CustomMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
      if (params.interpolateParams) {
        // tslint:disable-next-line: no-string-literal
        return params.interpolateParams['Default'] || params.key;
      }
      return params.key;
    }
  }

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotificationsComponent,
    SettingsComponent,
    UsersComponent,
    ConstructionSiteComponent,
    ConstructionSiteDetailsComponent,
    NavbarComponent,
    HeaderComponent,
    NoteDialogComponent,
    TaskDialogComponent,
    WorktimeDialogComponent,
    UserDialogComponent,
    MaterialDialogComponent,
    ConstructionSiteDialogComponent,
    MaterialTabComponent,
    WorktimeTabComponent,
    GalleryTabComponent,
    TimestampPipe,
    DetailsTabComponent,
    ImageDialogComponent,
    ConfirmationDialogComponent,
    NotFoundComponent,
    TaskTabComponent,
    NoteTabComponent,
    TasksComponent,
    ConstructionSiteDownloadDialogComponent,
    ExportWorktimeDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    AppRoutingModule,
    MatSidenavModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatListModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    MatSliderModule,
    MatMenuModule,
    MatSortModule,
    MatBadgeModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler, useClass: CustomMissingTranslationHandler
      }
    })
  ],
  providers: [SidenavService, LayoutService,
    {provide: MAT_DATE_LOCALE, useValue: 'de-DE'},
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
