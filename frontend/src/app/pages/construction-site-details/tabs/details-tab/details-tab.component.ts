import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ConstructionSiteDialogComponent } from 'src/app/components/construction-site-dialog/construction-site-dialog.component';
import { ConstructionSite } from 'src/app/models/constructionSite';
import { ConstructionSiteService } from 'src/app/services/construction-site.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { User, Worker } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { map, startWith } from 'rxjs/operators';
// tslint:disable-next-line: max-line-length
import { ConstructionSiteDownloadDialogComponent } from 'src/app/components/construction-site-download-dialog/construction-site-download-dialog.component';
import { MaterialService } from 'src/app/services/material.service';
import { WorktimeService } from 'src/app/services/worktime.service';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-details-tab',
  templateUrl: './details-tab.component.html',
  styleUrls: ['./details-tab.component.scss'],
})
export class DetailsTabComponent implements OnInit, OnDestroy {
  @Input() constructionSite: ConstructionSite;
  editable: boolean;
  form: FormGroup;
  users: Worker[] = [];
  filteredOptions: Observable<Worker[]>;
  inviteForm: FormControl;
  subscriptions: Subscription[] = [];
  workedHours: number;
  workedMinutes: number;
  openTasks: number;
  completedTasks: number;
  permissions: Promise<User>;
  constructor(
    private constructionSiteService: ConstructionSiteService,
    private taskService: TaskService,
    private userService: UserService,
    private materialService: MaterialService,
    private worktimeService: WorktimeService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private changeDetection: ChangeDetectorRef,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.permissions = this.userService.getProfile();
    this.inviteForm = new FormControl();
    this.workedHours = 0;
    this.workedMinutes = 0;
    this.openTasks = 0;
    this.completedTasks = 0;

    this.form = new FormGroup({
      name: new FormControl(
        this.constructionSite.name ? this.constructionSite.name : '',
        [Validators.required, Validators.minLength(3)]
      ),
      address: new FormControl(
        this.constructionSite.contact.address
          ? this.constructionSite.contact.address
          : ''
      ),
      email: new FormControl(
        this.constructionSite.contact.email
          ? this.constructionSite.contact.email
          : ''
      ),
      customername: new FormControl(
        this.constructionSite.contact.name
          ? this.constructionSite.contact.name
          : ''
      ),
      city: new FormControl(
        this.constructionSite.contact.city
          ? this.constructionSite.contact.city
          : ''
      ),
      zip: new FormControl(
        this.constructionSite.contact.zip
          ? this.constructionSite.contact.zip
          : ''
      ),
      phone: new FormControl(
        this.constructionSite.contact.phone
          ? this.constructionSite.contact.phone
          : ''
      ),
    });
    this.filteredOptions = this.inviteForm.valueChanges.pipe(
      startWith<string | Worker>(''),
      map((value) =>
        value
          ? this._filter(typeof value === 'string' ? value : value.name)
          : null
      )
    );
    this.taskService.getConstructionSiteTasks(this.constructionSite.id)
    .then((data) => {
      data.forEach((item) => {
        if (item.status === 'open') {
          this.openTasks = this.openTasks + 1;
        } else if (item.status === 'completed') {
          this.completedTasks = this.completedTasks + 1;
        }
      });
    }).catch((e) => {
      console.log(e);
    });
    this.worktimeService.getConstructionSiteWorktime(this.constructionSite.id).then((data) => {
      data.forEach((item) => {
        this.workedMinutes = item.minutes + this.workedMinutes;
        this.workedHours = item.hours +  this.workedHours;

        if (this.workedMinutes >= 60) {
          this.workedHours =  this.workedHours + Math.floor(this.workedMinutes / 60);
          this.workedMinutes = this.workedMinutes % 60;
         }
      });
    }).catch((e) => {
      console.log('error');
      console.log(e);
    });

    this.form.disable();
    this.userService
      .getUsers()
      .then((data: User[]) => {
        this.users = data.filter((user) => {
          for (const worker of this.constructionSite.users) {
            if (worker.userId === user.id) {
              return false;
            }
          }
          return true;
        });
      })
      .catch((e) => {
        console.log('error');
        console.log(e);
      });
  }
  getOptionText(option) {
    return option?.name;
  }

  editConstructionSite() {
    const dialogRef = this.dialog.open(ConstructionSiteDialogComponent, {
      width: '550px',
      data: { data: this.constructionSite },
    });
    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result.action === 'edit') {
            this.constructionSiteService
              .updateConstructionSite(result.data)
              .then((data) => {
                this.translate
                  .get('snackbar.successfully_updated_construction')
                  .subscribe((message) => {
                    this.snackBar.open(message, 'X', {
                      duration: 2000,
                    });
                  });
                this.constructionSite = data;
              })
              .catch((e) => {
                this.translate
                  .get('snackbar.failed_to_update_construction')
                  .subscribe((message) => {
                    this.snackBar.open(message, 'X', {
                      duration: 2000,
                    });
                  });
              });
          }
        }
      })
    );
  }

  deleteConstructionSite() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.constructionSiteService
          .removeConstructionSite(this.constructionSite.id)
          .then(
            () => {
              this.translate
                .get('snackbar.successfully_deleted_construction')
                .subscribe((message) => {
                  this.snackBar.open(message, 'X', {
                    duration: 2000,
                  });
                });
              this.router.navigate(['/constructionSites']);
            },
            (e) => {
              this.translate
                .get('snackbar.failed_to_delete_construction')
                .subscribe((message) => {
                  this.snackBar.open(message, 'X', {
                    duration: 2000,
                  });
                });
            }
          );
      }
    });
  }

  changeConstructionSiteStatus(event) {
    console.log(event);
    if (event.checked) {
      this.constructionSite.status = 'completed';
    } else {
      this.constructionSite.status = 'open';
    }
    this.constructionSiteService
      .updateConstructionSite(this.constructionSite)
      .then((data) => {
        this.translate
          .get('snackbar.successfully_updated_construction')
          .subscribe((message) => {
            this.snackBar.open(message, 'X', {
              duration: 2000,
            });
          });
        this.constructionSite = data;
      })
      .catch((e) => {
        this.translate
          .get('snackbar.failed_to_update_construction')
          .subscribe((message) => {
            this.snackBar.open(message, 'X', {
              duration: 2000,
            });
          });
        // reset status changes
        if (event.checked) {
          this.constructionSite.status = 'open';
        } else {
          this.constructionSite.status = 'completed';
        }
      });
  }

  private _filter(value: string): Worker[] {
    const filterValue = value.toLowerCase();

    return this.users.filter(
      (option) => option.name.toLowerCase().indexOf(filterValue) === 0
    );
  }
  downloadCSV() {
    const dialogRef = this.dialog.open(
      ConstructionSiteDownloadDialogComponent,
      {
        data: { material: false, worktime: false },
      }
    );
    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((result) => {
        try {
          if (result) {
            if (result.material) {
              this.materialService
                .getConstructionSiteMatieral(this.constructionSite.id, true)
                .then((data) => {
                  this.translate.get('construction.tabs.material').subscribe(
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
                })
                .catch((e) => {
                  console.log(e);
                  throw new Error('material-download-failed');
                });
            }
            if (result.worktime) {
              this.worktimeService
                .getConstructionSiteWorktime(this.constructionSite.id, true)
                .then((data) => {
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
                      throw new Error('worktime-download-failed');
                    }
                  );
                })
                .catch((e) => {
                  console.log(e);
                  throw new Error('worktime-download-failed');
                });
            }
          }
        } catch (e) {
          if (e?.message === 'worktime-download-failed') {
            this.translate
            .get('snackbar.worktime-download-failed')
            .subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          } else if (e?.message === 'material-download-failed') {
            this.translate
            .get('snackbar.material-download-failed')
            .subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          }
        }
      })
    );
  }

  addWorker() {
    if (!this.inviteForm.value?.id && !this.inviteForm.value) {
      return;
    } else if (!this.inviteForm.value?.id && this.inviteForm.value) {
      const invitedUser = this.users.filter((item) => item.name.toLowerCase() === this.inviteForm.value.toLowerCase())[0];
      this.inviteForm.setValue({id: invitedUser.id, name: invitedUser.name});
    }
    this.constructionSiteService
      .addWorkerToConstructionSite(
        this.constructionSite.id,
        this.inviteForm.value.id
      )
      .then((workers) => {
        this.constructionSite.users = workers;
        this.translate
          .get('snackbar.successfully_added_worker_to_construction')
          .subscribe((message) => {
            this.snackBar.open(message, 'X', {
              duration: 2000,
            });
          });
      })
      .catch(() => {
        this.translate
          .get('snackbar.failed_to_add_worker_to_construction')
          .subscribe((message) => {
            this.snackBar.open(message, 'X', {
              duration: 2000,
            });
          });
      });
    this.inviteForm.reset();
  }

  removeWorker(worker: any) {
    this.constructionSiteService
      .removeWorkerFromConstructionSite(this.constructionSite.id, worker.userId)
      .then((status) => {
        this.translate
          .get('snackbar.successfully_removed_worker_from_construction')
          .subscribe((message) => {
            this.snackBar.open(message, 'X', {
              duration: 2000,
            });
          });
        this.constructionSite.users = this.constructionSite.users.filter(
          (user) => {
            return user.name.toLowerCase().trim() !== worker?.name.toLowerCase().trim();
          }
        );

        let inAutocomplete = false;
        for (const user of this.users) {
          if (user.id === worker.userId) {
            inAutocomplete = true;
            break;
          }
        }
        if (!inAutocomplete) {
         this.users.push({ id: worker.userId, name: worker.name });
        }
        this.changeDetection.detectChanges();
      })
      .catch((e) => {
        this.translate
          .get('snackbar.failed_to_removed_worker_from_construction')
          .subscribe((message) => {
            this.snackBar.open(message, 'X', {
              duration: 2000,
            });
          });
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
