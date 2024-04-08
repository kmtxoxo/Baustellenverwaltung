import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { TaskDialogComponent } from './components/task-dialog/task-dialog.component';
import { ConstructionSiteComponent } from './pages/construction-site/construction-site.component';
import { UsersComponent } from './pages/users/users.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ConstructionSiteDetailsComponent } from './pages/construction-site-details/construction-site-details.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { TasksComponent } from './pages/tasks/tasks.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'notifications',
    pathMatch: 'full'
  },
  { path: 'tasks', component: TasksComponent },
  { path: 'constructionSites', component: ConstructionSiteComponent },
  { path: 'users', component: UsersComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'settings', component: SettingsComponent},
  { path: 'constructionSites/:id', component: ConstructionSiteDetailsComponent},
  { path: '404', component: NotFoundComponent},
  {path: '**', redirectTo: '/404'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
