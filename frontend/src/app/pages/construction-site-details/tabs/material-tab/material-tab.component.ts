import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { MaterialDialogComponent } from 'src/app/components/material-dialog/material-dialog.component';
import { Material } from 'src/app/models/material';
import { TranslateService } from '@ngx-translate/core';
import { MaterialService } from 'src/app/services/material.service';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-material-tab',
  templateUrl: './material-tab.component.html',
  styleUrls: ['./material-tab.component.scss']
})
export class MaterialTabComponent implements OnInit, OnDestroy {


  @Input() constructionSiteId: number;
  loading: boolean;
  loadingFailed: boolean;
  materials: Material[];
  permissions: Promise<User>;
  subscriptions: Subscription[] = [];
  constructor(
    private materialService: MaterialService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private changeDetection: ChangeDetectorRef,
    public dialog: MatDialog)  { }

  ngOnInit() {
    this.loading = true;
    this.loadingFailed = false;
    this.permissions = this.userService.getProfile();
    this.materialService.getConstructionSiteMatieral(this.constructionSiteId).then((data) => {
      this.materials = data;
      this.loading = false;
    }).catch((e) => {
      this.loading = false;
      this.loadingFailed = true;
      console.log('error');
      console.log(e);
    });
  }

  addMaterial(material?: Material) {
    material = material ? material : null;
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      width: '550px',
      data: { data: material}
    });
    this.subscriptions.push(
    dialogRef.afterClosed().subscribe((result: {action: string; data: Material}) => {
      if (result) {
        result.data.constructionSiteId = this.constructionSiteId;
        if (result.action === 'delete') {
          this.materialService.removeConstructionSiteMaterial(this.constructionSiteId, result.data.id).then((data) => {
            this.translate.get('snackbar.successfully_deleted_material').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            let index = 0;
            for ( const element of this.materials) {
              if (element.id === result.data.id) {
                this.materials.splice(index, 1);
                this.changeDetection.detectChanges();
                break;
              }
              index = index + 1;
            }
          }).catch(() => {
            this.translate.get('snackbar.failed_to_delete_material').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        } else if  (result.action === 'create') {
          this.materialService.addMaterial(result.data).then((data) => {
            this.translate.get('snackbar.successfully_added_material').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            this.materials.push(result.data);
          }).catch(() => {
            this.translate.get('snackbar.failed_to_add_material').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        } else if  (result.action === 'edit') {
          console.log(result.data);
          this.materialService.updateMaterial(result.data).then((data) => {
            this.translate.get('snackbar.successfully_updated_material').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            let index = 0;
            for ( const element of this.materials) {
              if (element.id === data.id) {
                this.materials[index] = data;
                this.changeDetection.detectChanges();
                break;
              }
              index = index + 1;
            }
          }).catch(() => {
            this.translate.get('snackbar.failed_to_update_material').subscribe((message) => {
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
