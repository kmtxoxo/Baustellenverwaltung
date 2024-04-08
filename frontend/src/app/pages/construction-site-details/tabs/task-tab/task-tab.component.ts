import { OnChanges, SimpleChanges } from '@angular/core';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { TaskDialogComponent } from 'src/app/components/task-dialog/task-dialog.component';
import { Task } from 'src/app/models/task';
import { User, Worker } from 'src/app/models/user';
import { AvailableLayouts, LayoutService } from 'src/app/services/layout.service';
import { TaskService } from 'src/app/services/task.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-task-tab',
  templateUrl: './task-tab.component.html',
  styleUrls: ['./task-tab.component.scss']
})
export class TaskTabComponent implements OnInit, OnChanges {

  constructor(
    private taskService: TaskService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private changeDetection: ChangeDetectorRef,
    private layoutService: LayoutService,
    private userService: UserService,
    public dialog: MatDialog) { }

  permissions: Promise<User>;
  displayedColumns: string[] = ['status', 'title', 'text', 'priority', 'assignedTo', 'createdAt'];
  dataSource: MatTableDataSource<Task>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  viewMode: 'tiles' | 'list';
  filterObj: {user: string, status: '' | 'open' | 'completed'} = { user: '', status: ''};

  @Input() constructionSiteId: number;

  @Input() worker: Worker[];
  profile: User;
  loading: boolean;
  layout$: Observable<AvailableLayouts>;
  loadingFailed: boolean;
  // pageOptions for Tile-view
  pageIndex = 1;
  pageSize = 20;

  tasks: Task[];
  subscriptions: Subscription[] = [];
  ngOnInit(): void {
    this.loading = true;
    this.permissions = this.userService.getProfile();
    this.taskService.getConstructionSiteTasks(this.constructionSiteId)
    .then((data) => {
      this.tasks = data;
      this.setTableDatasource();
      this.loading = false;
    }).catch((e) => {
      this.loading = false;
      this.loadingFailed = true;
      console.log(e);
    });

    this.userService.getProfile().then((profile) => {
      this.profile = profile;
    });
    this.layout$ = this.layoutService.getLayout();
    this.subscriptions.push(this.layout$.subscribe((screen) => {
      if (screen.layout === 'desktop') {
        this.viewMode = 'list';
      } else {
        this.viewMode = 'tiles';
      }
    }));
  }

  applyFilter(input: '' | 'open' | 'completed') {
    this.filterObj.status = input;
    this.dataSource.filter =  JSON.stringify(this.filterObj).toLowerCase();
  }

  filterMyTasks(filter: boolean) {
    if (filter) {
      this.filterObj.user = this.profile.id.toString();
    } else {
      this.filterObj.user = '';
    }
    this.dataSource.filter = JSON.stringify(this.filterObj).toLowerCase();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.worker.previousValue && changes.worker.previousValue?.length > changes.worker.currentValue?.length) {
      this.taskService.getConstructionSiteTasks(this.constructionSiteId)
      .then((data) => {
        this.tasks = data;
        this.setTableDatasource();
        this.loading = false;
      }).catch((e) => {
        this.loading = false;
        this.loadingFailed = true;
        console.log(e);
      });
    }
}

  goToLastPage() {
    this.pageIndex = Math.trunc((this.dataSource?.filteredData?.length + this.pageSize - 1 ) / this.pageSize) ;
  }

  addTask(task?: Task) {
    task = task ? task : null;
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '550px',
      data: { data: task, worker: this.worker}
    });
    this.subscriptions.push(
    dialogRef.afterClosed().subscribe((result: {action: string; data: Task}) => {
      if (result) {
        result.data.constructionSiteId = this.constructionSiteId;
        if (result.action === 'delete') {
          this.taskService.removeConstructionSiteTask(this.constructionSiteId, result.data.id).then((data) => {
            this.translate.get('snackbar.successfully_deleted_task').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            let index = 0;
            for ( const element of this.tasks) {
              if (element.id === result.data.id) {
                this.tasks.splice(index, 1);
                this.changeDetection.detectChanges();
                break;
              }
              index = index + 1;
            }
            this.setTableDatasource();
          }).catch(() => {
            this.translate.get('snackbar.failed_to_delete_task').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        } else if  (result.action === 'create') {
          this.taskService.addConstructionSiteTask(result.data).then((data) => {
            this.translate.get('snackbar.successfully_added_task').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            this.tasks.push(data);
            this.setTableDatasource();
          }).catch(() => {
            this.translate.get('snackbar.failed_to_add_task').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        } else if  (result.action === 'edit') {
          this.taskService.updateConstructionSiteTask(result.data, result.data.id).then((data) => {
            this.translate.get('snackbar.successfully_updated_task').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            let index = 0;

            for ( const element of this.tasks) {
              if (element.id === data.id) {
                this.tasks[index] = data;
                this.changeDetection.detectChanges();
                break;
              }
              index = index + 1;
            }
            this.setTableDatasource();
          }).catch(() => {
            this.translate.get('snackbar.failed_to_update_task').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        }
      }
    }));
  }

  setTableDatasource() {
    this.dataSource = new MatTableDataSource<Task>(this.tasks);
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate =
    (task: Task, filter: string) => {

      if (this.filterObj.status === 'open' && task.status === 'in_progress') {
        return true;
      }
      if (this.filterObj.user && task.assignedTo?.userId?.toString() !== this.filterObj.user) {
        return false;
      }
      if (this.filterObj.status && task.status !== this.filterObj.status) {
        return false;
      }
      return true;
    };
  }
}
