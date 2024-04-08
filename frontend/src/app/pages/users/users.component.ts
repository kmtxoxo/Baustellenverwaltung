import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { MatTableDataSource } from '@angular/material/table';
import {MatPaginator } from '@angular/material/paginator';
import {MatDialog } from '@angular/material/dialog';
import {MatSnackBar } from '@angular/material/snack-bar';
import { AvailableLayouts, LayoutService } from 'src/app/services/layout.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/services/user.service';
import { UserDialogComponent } from 'src/app/components/user-dialog/user-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { WorktimeService } from 'src/app/services/worktime.service';
import { ExportWorktimeDialogComponent } from 'src/app/components/export-worktime-dialog/export-worktime-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['select', 'name', 'status', 'role', 'email', 'phone', 'address', 'action'];
  users: User[] = [];
  dataSource: MatTableDataSource<User>;
  subscriptions: Subscription[] = [];
  loading: boolean;
  loadingFailed: boolean;
  permissions: Promise<User>;
  selection = new SelectionModel<User>(true, []);

  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }
  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private layoutService: LayoutService,
    private translate: TranslateService,
    private worktimeService: WorktimeService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadingFailed = false;
    this.loading = true;
    this.userService.getUsers()
      .then((data) => {
        this.users = data;
        this.dataSource = new MatTableDataSource<User>(this.users);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      })
      .catch((e) => {
        console.log('error');
        console.log(e);
        this.loadingFailed = true;
        this.loading = false;
      });
    this.subscriptions.push(
        this.layoutService
          .getLayout()
          .subscribe((currentDevice: AvailableLayouts) => {
            if (currentDevice.layout === 'phone') {
              this.displayedColumns = ['select', 'name', 'status', 'role', 'action'];
            } else {
              this.displayedColumns = ['select', 'name', 'status', 'role', 'email', 'phone', 'address', 'action'];
            }
          })
      );
    this.permissions = this.userService.getProfile();
  }

  addUser(user?: User) {
    user = user ? user : null;
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '550px',
      data: { data: user },
    });
    this.subscriptions.push(
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        if (result.action === 'delete') {
          this.userService.deleteUser(user.id)
            .then(() => {
              this.translate.get('snackbar.successfully_deleted_employee').subscribe((message) => {
                this.snackBar.open(message, 'X', {
                  duration: 2000,
                });
              });
              let index = 0;
              for (const element of this.users) {
                if (element.id === user.id) {
                  this.users.splice(index, 1);
                  break;
                }
                index = index + 1;
              }
              this.dataSource = new MatTableDataSource<User>(
                this.users
              );
            })
            .catch((e) => {
              this.translate.get('snackbar.failed_to_delete_employee').subscribe((message) => {
                this.snackBar.open(message, 'X', {
                  duration: 2000,
                });
              });
            });
        } else if (result.action === 'create') {
          console.log('trying to invite user');
          this.userService.inviteUser(result.data)
            .then((item) => {
              this.translate.get('snackbar.successfully_added_employee').subscribe((message) => {
                this.snackBar.open(message, 'X', {
                  duration: 2000,
                });
              });
              this.users.push(item);
              this.dataSource = new MatTableDataSource<User>(
                this.users
              );
            })
            .catch((e) => {
              this.translate.get('snackbar.failed_to_add_employee').subscribe((message) => {
                this.snackBar.open(message, 'X', {
                  duration: 2000,
                });
              });
            });
        } else if (result.action === 'edit') {
          this.userService
            .updateUser(result.data)
            .then((data) => {
              this.translate.get('snackbar.successfully_updated_employee').subscribe((message) => {
                this.snackBar.open(message, 'X', {
                  duration: 2000,
                });
              });
              let index = 0;
              for (const element of this.users) {
                if (element.id === user.id) {
                  this.users[index] = data;
                  console.log(data);
                  console.log('found and updated User');
                  break;
                }
                index = index + 1;
              }
              this.dataSource = new MatTableDataSource<User>(
                this.users
              );
            })
            .catch((e) => {
              this.translate.get('snackbar.failed_to_updated_employee').subscribe((message) => {
                this.snackBar.open(message, 'X', {
                  duration: 2000,
                });
              });
            });
        }
      }
    }));
  }

  openWorktimeDialog(user: User) {
    let users = [];
    if (this.selection.isEmpty()) {
      users.push(user);
    } else {
      users = this.selection.selected;
    }

    // after close
    const dialogRef = this.dialog.open(ExportWorktimeDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
        console.log('hey');
        if (result) {
            console.log('hey2');
            try {
            this.worktimeService.getWorktimeByUserIds(users, result.start, result.end).then((data) => {
              this.translate.get('construction.tabs.working_hours').subscribe(
                (translation) => {
                  const blob = new Blob([data], { type: 'text/csv' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = translation + '.csv';
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(link.href), 0);
                },
                () => {
                  throw new Error('material-download-failed');
                }
              );
            }).catch((e) => {
              this.translate.get('snackbar.worktime-download-failed').subscribe((message) => {
                this.snackBar.open(message, 'X', {
                  duration: 2000,
                });
              });
            });
          } catch (e) {
            this.translate.get('snackbar.worktime-download-failed').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          }
        }
    });

  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
