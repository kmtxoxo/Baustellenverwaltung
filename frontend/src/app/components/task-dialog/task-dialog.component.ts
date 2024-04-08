import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Task } from 'src/app/models/task';
import { User, Worker } from 'src/app/models/user';
import { ConstructionSiteService } from 'src/app/services/construction-site.service';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit {

  loading: boolean;
  statusSlider: number;

  filteredOptions: Observable<Worker[]>;
  priorities: string[] = ['high', 'normal', 'low'];

  editTask: boolean;
  form: FormGroup;
  constructor(
    private constructionSiteService: ConstructionSiteService,
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public task: {data: Task, worker: Worker[], action: string}) {}

  ngOnInit(): void {

    if (!this.task.data) {
      this.task.data = new Task();
      this.editTask = false;
    } else {
      this.editTask = true;
    }
    if (!this.task.worker) {
      this.task.worker = [];
      this.constructionSiteService.getConstructionSiteById(this.task.data.constructionSiteId).then((site) => {
        this.task.worker = site.users;
      }).catch((e) => {
        this.task.worker = [];
      });
    }

    this.form = new FormGroup({
      text: new FormControl( this.task.data.text ? this.task.data.text : ''),
      title: new FormControl(this.task.data.title ? this.task.data.title : '', [Validators.required, Validators.minLength(3)]),
      priority: new FormControl( this.task.data.priority ? this.task.data.priority : 'normal'),
      assignedTo: new FormGroup({
        user: new FormControl( this.task.data.assignedTo?.user ? this.task.data.assignedTo?.user : null),
        userId: new FormControl( this.task.data.assignedTo?.userId ? this.task.data.assignedTo?.userId : null),
      }),
      status: new FormControl( this.task.data.status ? this.task.data.status : 'open'),
    });

    this.filteredOptions = this.form.get('assignedTo.user').valueChanges.pipe(
      startWith<string | Worker>(''),
      map(value => value ? this._filter( typeof value === 'string' ? value : value.name) : null)
    );

    switch (this.task.data?.status) {
      case 'completed': this.statusSlider = 2; break;
      case 'in_progress': this.statusSlider = 1; break;
      case 'open': this.statusSlider = 0; break;
      default: this.statusSlider = 0; break;
    }

  }

  updateSliderValue(value) {
    this.statusSlider = value;
    switch (this.statusSlider) {
      case 0: this.form.setValue( {...this.form.value, status: 'open' }); break;
      case 1: this.form.setValue( {...this.form.value, status: 'in_progress' }); break;
      case 2: this.form.setValue( {...this.form.value, status: 'completed' }); break;
      default: case 0: this.form.setValue( {...this.form.value, status: 'open' }); break;
    }

  }

  private _filter(value: string): Worker[] {
    const filterValue = value.toLowerCase();

    return this.task.worker.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }


  updateAssignedTo() {
    if (this.form.get('assignedTo.user').value?.length === 0 ) {
      this.form.setValue( {...this.form.value, assignedTo: { user: null, userId: null } });
      return;
    }
    for ( const user of this.task.worker) {
      if (this.form.get('assignedTo.user').value?.trim() === user.name) {
        this.form.setValue( {...this.form.value, assignedTo: { user: user.name, userId: user.userId } });
        break;
      }
    }
  }

  onCreateClicked() {
    this.updateAssignedTo();
    this.task.action = 'create';
    this.task.data = { ...this.task.data, ...this.form.value};
    this.dialogRef.close(this.task);
  }

  onDeleteClicked() {
    this.task.action = 'delete';
    this.task.data = { ...this.task.data, ...this.form.value};
    this.dialogRef.close(this.task);
  }

  onSaveChangeClicked() {
    this.updateAssignedTo();
    this.task.action = 'edit';
    this.task.data = { ...this.task.data, ...this.form.value};
    this.dialogRef.close(this.task);
  }

  onCancelClicked() {
    this.dialogRef.close();
  }
}
