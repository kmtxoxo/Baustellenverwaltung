import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { Worktime } from 'src/app/models/worktime';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-worktime-dialog',
  templateUrl: './worktime-dialog.component.html',
  styleUrls: ['./worktime-dialog.component.scss']
})
export class WorktimeDialogComponent implements OnInit {


  form: FormGroup;
  editArbeitszeit: boolean;
  profile: User;
  constructor(
    public dialogRef: MatDialogRef<WorktimeDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public note: { data: Worktime; action: string },
  ) {}

  ngOnInit() {
    if (!this.note.data) {
      this.note.data = new Worktime();
      this.editArbeitszeit = false;
    } else {
      this.editArbeitszeit = true;
    }

    this.userService.getProfile().then((profile) => {
      if (
        (this.note.data.start &&
          this.note.data.end &&
          typeof this.note.data.start === 'string') ||
        typeof this.note.data.end === 'string'
      ) {
        this.note.data.start = new Date(this.note.data.start);
        this.note.data.end = new Date(this.note.data.end);
      }

      this.profile = profile;
      this.form = new FormGroup({
        startuhrzeit: new FormControl(
          this.dateToTimeinput(this.note.data.start)
        ),
        startdatum: new FormControl(
          this.note.data.start ? this.note.data.start : new Date()
        ),
        text: new FormControl(
          this.note.data.text ? this.note.data.text : ''
        ),
        enduhrzeit: new FormControl(this.dateToTimeinput(this.note.data.end)),
      });
    });
  }

  onCreateClicked() {
    this.note.action = 'create';
    this.note.data.start = this.form.value.startdatum as Date;
    this.note.data.start.setHours(this.form.value.startuhrzeit.split(':')[0]);
    this.note.data.start.setMinutes(
      this.form.value.startuhrzeit.split(':')[1]
    );

    this.note.data.end = new Date(this.form.value.startdatum);
    this.note.data.end.setHours(this.form.value.enduhrzeit.split(':')[0]);
    this.note.data.end.setMinutes(this.form.value.enduhrzeit.split(':')[1]);

    const diffMs =
      this.note.data.end.getTime() - this.note.data.start.getTime(); // milliseconds between start & end
    this.note.data.minutes = Math.round(
      ((diffMs % 86400000) % 3600000) / 60000
    );
    this.note.data.hours = Math.floor((diffMs % 86400000) / 3600000);
    this.note.data.createdBy = {
      user: this.profile.name,
      userId: this.profile.id,
    };
    this.note.data.text = this.form.value.text;

    this.dialogRef.close(this.note);
  }

  onDeleteClicked() {
    this.note.action = 'delete';
    this.note.data = { ...this.note.data, ...this.form.value };
    this.dialogRef.close(this.note);
  }

  onSaveChangeClicked() {
    this.note.action = 'edit';
    this.note.data.start = this.form.value.startdatum as Date;
    this.note.data.start.setHours(this.form.value.startuhrzeit.split(':')[0]);
    this.note.data.start.setMinutes(
      this.form.value.startuhrzeit.split(':')[1]
    );

    this.note.data.end = new Date(this.form.value.startdatum);
    this.note.data.end.setHours(this.form.value.enduhrzeit.split(':')[0]);
    this.note.data.end.setMinutes(this.form.value.enduhrzeit.split(':')[1]);
    this.note.data.text = this.form.value.text;

    const diffMs =
      this.note.data.end.getTime() - this.note.data.start.getTime(); // milliseconds between start & end
    this.note.data.minutes = Math.round(
      ((diffMs % 86400000) % 3600000) / 60000
    );
    this.note.data.hours = Math.floor((diffMs % 86400000) / 3600000);

    this.dialogRef.close(this.note);
  }

  onCancelClicked() {
    this.dialogRef.close();
  }

  dateToTimeinput(date: Date): string {
    if (date) {
      return (
        (date.getHours() < 10 ? '0' : '') +
        date.getHours() +
        ':' +
        (date.getMinutes() < 10 ? '0' : '') +
        date.getMinutes()
      );
    } else {
      date = new Date();
      return (
        (date.getHours() < 10 ? '0' : '') +
        date.getHours() +
        ':' +
        (date.getMinutes() < 10 ? '0' : '') +
        date.getMinutes()
      );
    }
  }

}
