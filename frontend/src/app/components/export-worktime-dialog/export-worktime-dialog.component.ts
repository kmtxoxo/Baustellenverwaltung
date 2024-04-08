import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-export-worktime-dialog',
  templateUrl: './export-worktime-dialog.component.html',
  styleUrls: ['./export-worktime-dialog.component.scss']
})
export class ExportWorktimeDialogComponent implements OnInit {

  form: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<ExportWorktimeDialogComponent>
    ) { }

  ngOnInit(): void {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    this.form = new FormGroup({
      start: new FormControl(lastMonth),
      end: new FormControl(today)
    });
  }

}
