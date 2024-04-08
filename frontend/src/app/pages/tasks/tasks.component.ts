import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { TaskDialogComponent } from 'src/app/components/task-dialog/task-dialog.component';
import { Task } from 'src/app/models/task';
import { AvailableLayouts, LayoutService } from 'src/app/services/layout.service';
import { TaskService } from 'src/app/services/task.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {



  displayedColumns: string[] = ['status', 'title', 'text', 'priority', 'assignedTo', 'createdAt'];
  dataSource: MatTableDataSource<Task>;
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  viewMode: 'tiles' | 'list';

  // pageOptions for Tile-view
  pageIndex = 1;
  pageSize = 20;

  loading: boolean;
  loadingFailed: boolean;
  filter: '' | 'open' | 'in_progress' | 'completed' = '';
  layout$: Observable<AvailableLayouts>;
  tasks: Task[];
  subscriptions: Subscription[] = [];


  constructor(
    private taskService: TaskService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private changeDetection: ChangeDetectorRef,
    private layoutService: LayoutService,
    private userService: UserService,
    public dialog: MatDialog) { }


  ngOnInit(): void {
    this.loading = true;
    this.loadingFailed = false;

    this.userService.getProfile().then((profile) => {
      this.taskService.getTasksbyUserId(profile.id)
      .then((data) => {
        this.tasks = data;
        this.dataSource = new MatTableDataSource<Task>(this.tasks);
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate =
        (task: Task, filter: string) => {
          if (filter === 'open') {
            return !filter || task.status === 'open' || task.status === 'in_progress' ;
          }
          return !filter || task.status === filter;
        };
        this.loading = false;
      }).catch((e) => {
        console.log(e);
        this.loadingFailed = true;
        this.loading = false;
      });
    }).catch((e) => {
      console.log(e);
      this.loadingFailed = true;
      this.loading = false;
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
    this.filter = input;
    this.dataSource.filter =  input.trim().toLowerCase();
  }
  goToLastPage() {
    this.pageIndex = Math.trunc((this.dataSource?.filteredData?.length + this.pageSize - 1 ) / this.pageSize) ;
  }

  editTask(task?: Task) {
    task = task ? task : null;
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '550px',
      data: { data: task}
    });
    this.subscriptions.push(
    dialogRef.afterClosed().subscribe((result: {action: string; data: Task}) => {
      if (result) {
        if (result.action === 'delete') {
          this.taskService.removeConstructionSiteTask( result.data.constructionSiteId, result.data.id).then((data) => {
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
            this.dataSource = new MatTableDataSource<Task>(
              this.tasks
            );
          }).catch(() => {
            this.translate.get('snackbar.failed_to_delete_task').subscribe((message) => {
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
            this.dataSource = new MatTableDataSource<Task>(
              this.tasks
            );
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

}
