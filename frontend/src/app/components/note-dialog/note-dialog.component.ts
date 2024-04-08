import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Note } from 'src/app/models/note';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-note-dialog',
  templateUrl: './note-dialog.component.html',
  styleUrls: ['./note-dialog.component.scss']
})
export class NoteDialogComponent implements OnInit {


  editNotiz: boolean;
  form: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<NoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public note: {data: Note, action: string}) {}

  ngOnInit() {
    if (!this.note.data) {
      this.note.data = new Note();
      this.editNotiz = false;
    } else {
      this.editNotiz = true;
    }
    this.form = new FormGroup({
      text: new FormControl( this.note.data.text ? this.note.data.text : ''),
      title: new FormControl(this.note.data.title ? this.note.data.title : '', [Validators.required, Validators.minLength(3)]),
    });
  }

  onCreateClicked() {
    this.note.action = 'create';
    this.note.data = { ...this.note.data, ...this.form.value};
    this.dialogRef.close(this.note);
  }

  onDeleteClicked() {
    this.note.action = 'delete';
    this.note.data = { ...this.note.data, ...this.form.value};
    this.dialogRef.close(this.note);
  }

  onSaveChangeClicked() {
    this.note.action = 'edit';
    this.note.data = { ...this.note.data, ...this.form.value};
    this.dialogRef.close(this.note);
  }

  onCancelClicked() {
    this.dialogRef.close();
  }

}
