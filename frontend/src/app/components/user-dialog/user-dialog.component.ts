import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { PermissionService } from 'src/app/services/permission.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {


  permissions: any[];
  form: FormGroup;
  editMitarbeiter: boolean;
  readOnly: boolean;
  ownPermissions: Promise<User>;

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    private permissionService: PermissionService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public note: {data: User, action: string}) {}

  ngOnInit() {
    this.readOnly = false;
    if (!this.note.data) {
      this.note.data = new User();
      this.editMitarbeiter = false;
    } else {
      this.editMitarbeiter = true;
    }
    this.ownPermissions = this.userService.getProfile();
    this.ownPermissions.then((ownProfile) => {
      this.form = new FormGroup({
        name: new FormControl(this.note.data.name ? this.note.data.name : '',
         [Validators.required, Validators.minLength(3)]),
        role: new FormControl({value: this.note.data.role ? this.note.data.role : '',
          disabled: !ownProfile.permissions.users.write || ownProfile.id == this.note.data?.id},
        [Validators.required, Validators.minLength(3)]),
        email: new FormControl(this.note.data.email ? this.note.data.email : '',
          [Validators.required, Validators.email, Validators.minLength(3)]),
      });
    });
    this.permissionService.getPermissions().then((permissions) => {
      this.permissions = permissions;
    });
    if (this.note.data.id) {
      this.readOnly = true;
    }

  }

  onCreateClicked() {
    console.log('trying to invite account');
    this.note.action = 'create';
    this.note.data = { ...this.note.data, ...this.form.value};
    this.note.data.status = 'invited';
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
    if (this.note.data.email.length === 0) {
      this.note.data.status = 'offline';
    }
    this.dialogRef.close(this.note);
  }

  onCancelClicked() {
    this.dialogRef.close();
  }

}
