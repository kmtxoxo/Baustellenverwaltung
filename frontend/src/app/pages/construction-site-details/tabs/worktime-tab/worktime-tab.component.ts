import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';
import { Worktime } from 'src/app/models/worktime';
import { WorktimeService } from 'src/app/services/worktime.service';
import { TranslateService } from '@ngx-translate/core';
import { WorktimeDialogComponent } from 'src/app/components/worktime-dialog/worktime-dialog.component';
import { AvailableLayouts, LayoutService } from 'src/app/services/layout.service';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-worktime-tab',
  templateUrl: './worktime-tab.component.html',
  styleUrls: ['./worktime-tab.component.scss']
})
export class WorktimeTabComponent implements OnInit, OnDestroy {


  constructor(
    private worktimeService: WorktimeService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private changeDetection: ChangeDetectorRef,
    private userService: UserService,
    private layoutService: LayoutService,
    public dialog: MatDialog) { }
  @Input() constructionSiteId: number;
  worktimes: Worktime[];
  loading: boolean;
  loadingFailed: boolean;
  subscriptions: Subscription[] = [];
  permissions: Promise<User>;
  layout$: Observable<AvailableLayouts>;

  ngOnInit() {
    this.loading = true;
    this.loadingFailed = false;
    this.permissions = this.userService.getProfile();
    this.worktimeService.getConstructionSiteWorktime(this.constructionSiteId).then((data) => {
      this.loading = false;
      this.worktimes = data;
    }).catch((e) => {
      console.log('error');
      this.loading = false;
      this.loadingFailed = true;
      console.log(e);
    });
    this.layout$ = this.layoutService.getLayout();
  }

  addWorktime(worktime?: Worktime) {
    worktime = worktime ? worktime : null;
    const dialogRef = this.dialog.open(WorktimeDialogComponent, {
      width: '550px',
      data: { data: worktime}
    });
    this.subscriptions.push(
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.data.constructionSiteId = this.constructionSiteId;
        if (result.action === 'delete') {
          this.worktimeService.deleteConstructionSiteWorktime(result.data).then(() => {
            this.translate.get('snackbar.successfully_deleted_time').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            let index = 0;
            for ( const element of this.worktimes) {
              if (element.id === result.data.id) {
                this.worktimes.splice(index, 1);
                this.changeDetection.detectChanges();
                break;
              }
              index = index + 1;
            }
          }).catch((e) => {
            this.translate.get('snackbar.failed_to_delete_time').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        } else if  (result.action === 'create') {
          this.worktimeService.addConstructionSiteWorktime(result.data).then((data) => {
            this.worktimes.push(new Worktime(data));
            this.translate.get('snackbar.successfully_added_time').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          }).catch((e) => {
            this.translate.get('snackbar.failed_to_add_time').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        } else if  (result.action === 'edit') {
          this.worktimeService.updateConstructionSiteWorktime(result.data).then((data) => {
            this.translate.get('snackbar.successfully_updated_time').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            let index = 0;
            for ( const element of this.worktimes) {
              if (element.id === data.id) {
                this.worktimes[index] = data;
                this.changeDetection.detectChanges();
                break;
              }
              index = index + 1;
            }
          }).catch((e) => {
            this.translate.get('snackbar.failed_to_update_time').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
