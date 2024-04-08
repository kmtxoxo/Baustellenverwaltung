import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ConstructionSite } from 'src/app/models/constructionSite';
import { Task } from 'src/app/models/task';
import { Worktime } from 'src/app/models/worktime';
import { ConstructionSiteService } from 'src/app/services/construction-site.service';
import { AvailableLayouts, LayoutService } from 'src/app/services/layout.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TaskService } from 'src/app/services/task.service';
import { UserService } from 'src/app/services/user.service';
import { WorktimeService } from 'src/app/services/worktime.service';
import { Notification } from '../../models/notification';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  layout$: Observable<AvailableLayouts>;
  notifications: Notification[];
  workedHours: number;
  workedMinutes: number;
  openTasks: number;
  openConstructionSites: number;
  completedConstructionSites: number;
  ownUserId: number;
  loadingNotifications: boolean;
  loadingFailed: boolean;

  currentLanguage: string;
  constructor(
    private layoutService: LayoutService,
    private userService: UserService,
    private taskService: TaskService,
    private worktimeService: WorktimeService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private constructionSiteService: ConstructionSiteService) { }

  ngOnInit(): void {
    this.currentLanguage = this.translate.currentLang;
    this.layout$ = this.layoutService.getLayout();
    this.loadingNotifications = true;
    this.loadingFailed = false;
    this.notificationService.getNotifications().then((notifications) => {
      this.notifications = notifications;
      this.loadingNotifications = false;
    }).catch((e) => {
      this.loadingFailed = true;
      this.loadingNotifications = false;
    });

    this.workedHours = 0;
    this.workedMinutes = 0;
    this.openTasks = 0;
    this.openConstructionSites = 0;
    this.completedConstructionSites = 0;


    this.ownUserId =  this.userService.getOwnUserId();
    if (!this.ownUserId) {
      this.userService.getProfile().then((profile) => {
        this.ownUserId = profile.id;
        this.loadTiles(this.ownUserId);
      }).catch((e) => {
        console.log(e);
      });
    } else {
      this.loadTiles(this.ownUserId);
    }
  }

  loadTiles(userId: number) {
    this.taskService.getTasksbyUserId(userId)
    .then((data: Task[]) => {
      data.filter((task) =>  task.status === 'open' || task.status === 'in_progress');
      this.openTasks = data.length;
    }).catch((e) => {
      console.log(e);
    });

    this.constructionSiteService.getConstructionSite()
    .then((data: ConstructionSite[]) => {
      data.forEach((item) => {
        if (item.status === 'open') {
          this.openConstructionSites = this.openConstructionSites + 1;
        } else if (item.status === 'completed') {
          this.completedConstructionSites = this.completedConstructionSites + 1;
        }
      });
    }).catch((e) => {
      console.log(e);
    });

    const from = new Date();
    from.setDate(from.getDate() - 7);
    this.worktimeService.getWorktimeByUserId(userId, from)
    .then((data: Worktime[]) => {
      data.forEach((item) => {
        this.workedMinutes = item.minutes + this.workedMinutes;
        this.workedHours = item.hours +  this.workedHours;

        if (this.workedMinutes >= 60) {
          this.workedHours =  this.workedHours + Math.floor(this.workedMinutes / 60);
          this.workedMinutes = this.workedMinutes % 60;
         }
      });

    }).catch((e) => {
      console.log(e);
    });
  }

}
