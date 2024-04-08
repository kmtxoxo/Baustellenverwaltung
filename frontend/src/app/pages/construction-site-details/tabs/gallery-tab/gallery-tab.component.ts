import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ImageDialogComponent } from 'src/app/components/image-dialog/image-dialog.component';
import { User } from 'src/app/models/user';
import { ConstructionSiteService } from 'src/app/services/construction-site.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gallery-tab',
  templateUrl: './gallery-tab.component.html',
  styleUrls: ['./gallery-tab.component.scss']
})
export class GalleryTabComponent implements OnInit {

  images: string[] = [
    'assets/gallery1.png',
    'assets/gallery2.png',
    'assets/gallery3.png',
    'assets/gallery4.png',
    'assets/gallery5.png',
  ];
  loading: boolean;
  loadingFailed: boolean;
  error: boolean;
  permissions: Promise<User>;
  @Input() constructionSiteId: number;

  constructor(
    public dialog: MatDialog,
    private constructionSiteService: ConstructionSiteService,
    private translate: TranslateService,
    private userService: UserService,
    private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loading = true;
    this.loadingFailed = false;
    this.permissions = this.userService.getProfile();
    this.constructionSiteService.getConstructionSiteImages(this.constructionSiteId).then((images) => {
      for (const image of images) {
        this.images.push(environment.galleryLocation + image);
      }
      this.loading = false;
    }).catch((e) => {
      this.loading = false;
      this.loadingFailed = true;
    });
  }

  openModal(image: string) {
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      data: image,
    });
  }

  onSelectFile(event) {
    // called each time file input changes
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event1: any) => {
        // called once readAsDataURL is completed
        // send image to API
        this.constructionSiteService.uploadImageToConstructionSite(this.constructionSiteId, event.target.files).then((data) => {
          this.translate.get('snackbar.successfully_uploaded_image').subscribe((message) => {
            this.snackBar.open(message, 'X', {
              duration: 2000,
            });
          });
          for (const image of data) {
            this.images.push(environment.galleryLocation  + image);
          }
        }).catch((e) => {
          this.translate.get('snackbar.failed_to_uploade_image').subscribe((message) => {
            this.snackBar.open(message, 'X', {
              duration: 2000,
            });
          });
        });
      };
    }
  }
  closeModal() {}

}
