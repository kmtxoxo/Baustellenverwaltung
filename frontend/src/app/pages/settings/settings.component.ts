import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy  {

  languages: string[];
  form: FormGroup;
  formPw: FormGroup;
  validPassword: boolean;
  profile: User;
  subscriptions: Subscription[] = [];
  loadingFailed: boolean;
  loading: boolean;
  constructor(
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private userService: UserService) { }

  ngOnInit() {
    this.loading = true;
    this.loadingFailed = false;
    this.validPassword = false;
    this.languages = ['en', 'de'];
    this.loadUserSettings();
    this.formPw = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmation: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
    this.subscriptions.push(
    this.formPw.valueChanges.subscribe((value) => {
      if (value.newPassword === value.confirmation) {
        this.validPassword = true;
      } else {
        this.validPassword = false;
      }
    }));
  }

  loadUserSettings() {
    this.userService.getProfile().then( (profile) => {
      this.loading = false;
      this.profile = profile;
      this.form = new FormGroup({
        name: new FormControl( profile.name ? profile.name : '', [Validators.required, Validators.minLength(3)]),
        language: new FormControl(profile.language ? profile.language : 'de', [Validators.required, Validators.minLength(2)]),
        phone: new FormControl(profile.phone ? profile.phone : '', [Validators.required, Validators.minLength(3)]),
        email: new FormControl(profile.email ? profile.email : '', [Validators.required, Validators.minLength(3), Validators.email]),
        address: new FormControl(profile.address ? profile.address : '', [Validators.required, Validators.minLength(3)]),
        zip: new FormControl(profile.zip ? profile.zip : '', [Validators.required, Validators.minLength(3)]),
        city: new FormControl(profile.city ? profile.city : '', [Validators.required, Validators.minLength(3)]),
        id: new FormControl(this.profile.id)
      });
    }).catch((e) => {
      this.loading = false;
      this.loadingFailed = true;
    });
  }
  saveUserSettings() {
    this.translate.use(this.form.value.language);
    this.userService.updateUser(this.form.value).then(() => {
      this.translate.get('snackbar.successfully_updated_userinfo').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
    }).catch(() => {
      this.translate.get('snackbar.failed_to_update_userinfo').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
    });
  }
  changePassword() {
    this.userService.updatePassword(this.formPw.value.newPassword, this.profile.id).then(() => {
      this.translate.get('snackbar.successfully_updated_password').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
    }).catch(() => {
      this.translate.get('snackbar.failed_to_update_password').subscribe((message) => {
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
