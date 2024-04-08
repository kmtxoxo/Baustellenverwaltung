import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { ConstructionSite } from 'src/app/models/constructionSite';
import { ConstructionSiteService } from 'src/app/services/construction-site.service';
import { LayoutService, AvailableLayouts } from 'src/app/services/layout.service';
import { TranslateService } from '@ngx-translate/core';
import { ConstructionSiteDialogComponent } from 'src/app/components/construction-site-dialog/construction-site-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { MatSort, MatSortable } from '@angular/material/sort';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-construction-site',
  templateUrl: './construction-site.component.html',
  styleUrls: ['./construction-site.component.scss']
})
export class ConstructionSiteComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['position', 'name', 'status', 'modifiedAt', 'action'];
  constructionSites: ConstructionSite[];
  dataSource: MatTableDataSource<ConstructionSite>;
  tmpDate: Date = new Date();
  filter: '' | 'open' | 'completed' = '';
  subscriptions: Subscription[] = [];
  permissions: Promise<User>;
  loading: boolean;
  loadingFailed: boolean;
  @ViewChild(MatSort, {static: false})
  set sort(value: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = value;
      this.dataSource.sort.sort(({ id: 'modifiedAt', start: 'desc'}) as MatSortable);
      this.cdRef.detectChanges();
    }
  }

  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  constructor(
    private constructionSiteService: ConstructionSiteService,
    private userService: UserService,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private layoutService: LayoutService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.loadingFailed = false;
    this.permissions = this.userService.getProfile();
    this.constructionSiteService.getConstructionSite().then((data) => {
      this.loading = false;
      this.constructionSites = data;
      this.dataSource = new MatTableDataSource<ConstructionSite>(this.constructionSites);

      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }).catch((e) => {
      this.loading = false;
      this.loadingFailed = true;
      console.log('error');
      console.log(e);
    });

    this.subscriptions.push(this.layoutService.getLayout().subscribe((currentDevice: AvailableLayouts) => {
      if (currentDevice.layout === 'phone') {
        this.displayedColumns = ['position', 'name', 'status'];
      } else {
        this.displayedColumns = ['position', 'name', 'status', 'modifiedAt', 'action'];
      }
    }));
  }

  applyFilter(input: '' | 'open' | 'completed') {
    this.filter = input;
    this.dataSource.filter = this.filter.trim().toLowerCase();
    this.dataSource.sort = this.sort;
  }
  deleteConstructionSite(constructionSiteId) {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.constructionSiteService.removeConstructionSite(constructionSiteId).then((doc) => {
          console.log('deleted Construction site');
          let index = 0;
          for ( const element of this.constructionSites) {
            if (element.id === constructionSiteId) {
              this.constructionSites.splice(index, 1);
              break;
            }
            index = index + 1;
          }
          this.translate.get('snackbar.successfully_deleted_construction').subscribe((message) => {
            this.snackBar.open(message, 'X', {
              duration: 2000,
            });
          });
          this.dataSource = new MatTableDataSource<ConstructionSite>(this.constructionSites);
        }).catch((e) => {
          this.translate.get('snackbar.failed_to_delete_construction').subscribe((message) => {
            this.snackBar.open(message, 'X', {
              duration: 2000,
            });
          });
          console.log('couldn\'t remove User');
        });
      }
    }));
  }

  addBaustelle(constructionSite?: ConstructionSite) {
    constructionSite = constructionSite ? constructionSite : null;
    const dialogRef = this.dialog.open(ConstructionSiteDialogComponent, {
      width: '550px',
      data: { data: constructionSite}
    });

    this.subscriptions.push(
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if  (result.action === 'create') {
          console.log(result.data);
          this.constructionSiteService.addConstructionSite(result.data).then((data) => {
            console.log('added Baustelle');
            this.constructionSites.push(data);
            this.translate.get('snackbar.successfully_added_construction').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            this.dataSource = new MatTableDataSource<ConstructionSite>(this.constructionSites);
          }).catch((e) => {
            this.translate.get('snackbar.failed_to_add_construction').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        } else if  (result.action === 'edit') {
          this.constructionSiteService.updateConstructionSite(result.data).then((data) => {
            let index = 0;
            for ( const element of this.constructionSites) {
              if (element.id === data.id) {
                this.constructionSites[index] = Object.assign(result.data, {_rev: data.rev});
                this.translate.get('snackbar.successfully_updated_construction').subscribe((message) => {
                  this.snackBar.open(message, 'X', {
                    duration: 2000,
                  });
                });
                break;
              }
              index = index + 1;
            }
            this.dataSource = new MatTableDataSource<ConstructionSite>(this.constructionSites);
          }).catch((e) => {
            console.log(e);
            this.translate.get('snackbar.failed_to_update_construction').subscribe((message) => {
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
