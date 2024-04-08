import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NoteDialogComponent } from 'src/app/components/note-dialog/note-dialog.component';
import { Note } from 'src/app/models/note';
import { User } from 'src/app/models/user';
import { AvailableLayouts, LayoutService } from 'src/app/services/layout.service';
import { NoteService } from 'src/app/services/note.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-note-tab',
  templateUrl: './note-tab.component.html',
  styleUrls: ['./note-tab.component.scss']
})
export class NoteTabComponent implements OnInit {

  @Input() constructionSiteId: number;
  notes: Note[] = [];
  loading: boolean;
  loadingFailed: boolean;
  layout$: Observable<AvailableLayouts>;
  permissions: Promise<User>;
  subscriptions: Subscription[] = [];
  constructor(
    private noteService: NoteService,
    private layoutService: LayoutService,
    private translate: TranslateService,
    private changeDetection: ChangeDetectorRef,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.loading = true;
    this.loadingFailed = false;
    this.permissions = this.userService.getProfile();
    this.noteService.getConstructionSiteNote(this.constructionSiteId)
    .then((data) => {
      this.loading = false;
      this.notes = data;
    }).catch((e) => {
      this.loading = false;
      this.loadingFailed = true;
      console.log('error');
      console.log(e);
    });
    this.layout$ = this.layoutService.getLayout();
  }

  addNote(note?: Note) {
    note = note ? note : null;
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '550px',
      data: { data: note}
    });

    this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'delete') {
          this.noteService.removeConstructionSiteNote(this.constructionSiteId, result.data.id).then((doc) => {
            this.translate.get('snackbar.successfully_deleted_note').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            let index = 0;
            for ( const element of this.notes) {
              if (element.id == result.data.id) {
                this.notes.splice(index, 1);
                return;
              }
              index = index + 1;
            }
          }).catch((e) => {
            this.translate.get('snackbar.failed_to_delete_note').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        } else if  (result.action === 'create') {
          result.data.constructionSiteId = this.constructionSiteId;
          this.noteService.addConstructionSiteNote(result.data).then((res) => {
            this.translate.get('snackbar.successfully_added_note').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            this.notes.push(res);
            this.changeDetection.detectChanges();
          }).catch((e) => {
            this.translate.get('snackbar.failed_to_add_note').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
          });
        } else if  (result.action === 'edit') {
          this.noteService.updateConstructionSiteNote(result.data).then((doc) => {
            this.translate.get('snackbar.successfully_updated_note').subscribe((message) => {
              this.snackBar.open(message, 'X', {
                duration: 2000,
              });
            });
            let index = 0;
            console.log(doc);
            for ( const element of this.notes) {
              console.log(element.id);
              if (element.id == doc.id) {
                console.log('found');
                console.log(doc);
                this.notes[index] = doc;
                this.changeDetection.detectChanges();
                return;
              }
              index = index + 1;
            }
          }).catch((e) => {
            this.translate.get('snackbar.failed_to_update_note').subscribe((message) => {
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
