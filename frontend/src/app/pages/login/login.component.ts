import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { Validators, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  resetPassword: boolean;
  registerUser: boolean;
  isVerificationIdAvailable: boolean;
  isResetIdAvailable: boolean;
  email: string;
  emailRegex = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
  password: string;
  languages = ['de', 'en'];
  form: FormGroup;

  hidePw: boolean;
  stayLoggedIn: boolean;
  loginError: boolean;
  subscriptions: Subscription[] = [];

  constructor(
    private loginService: LoginService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.registerUser = false;
    this.resetPassword = false;
    this.hidePw = true;
    this.stayLoggedIn = false;
    this.loginError = false;
    this.subscriptions.push(
    this.route.queryParams
    .subscribe(params => {
      const verificationId = params.verificationId;
      const resetId = params.resetId;

      if (verificationId) {
        this.form = new FormGroup({
          name: new FormControl('', [Validators.required, Validators.minLength(3)]),
          email: new FormControl( '' , [Validators.required, Validators.minLength(3)]),
          address: new FormControl( '' , [Validators.required, Validators.minLength(3)]),
          zip: new FormControl( '' , [Validators.required, Validators.minLength(3), Validators.pattern('[0-9]+')]),
          city: new FormControl( '' , [Validators.required, Validators.minLength(3)]),
          language: new FormControl( 'de' , [Validators.required, Validators.minLength(1)]),
          phone: new FormControl( '' , [Validators.required, Validators.minLength(3), Validators.pattern('[0-9]+')]),
          password: new FormControl('', [Validators.required, Validators.minLength(8)]),
          confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
          verificationId: new FormControl(verificationId)
        }, this.passwordConfirming);
        this.registerUser = true;
        this.isVerificationIdAvailable = true;
      }
      if (resetId) {
        this.form = new FormGroup({
          password: new FormControl('', [Validators.required, Validators.minLength(8)]),
          resetId: new FormControl(resetId)
        });
        this.isResetIdAvailable = true;
      }
    }));
  }
  login() {
    this.loginService.login(this.email.toLowerCase(), this.password).then((data) => {
      this.translate.get('snackbar.successfully_logged_in').subscribe((message) => {
          this.snackBar.open(message, 'X', {
            duration: 2000,
          });
        });
      localStorage.setItem('token', data.accessToken );
      this.loginService.setLoggedInState(true);

    }).catch((e) => {
      this.loginError = true;
      this.translate.get('snackbar.failed_to_login').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
    });

    this.email = '';
    this.password = '';
  }

  stayLoggedInChange(event) {
    this.stayLoggedIn = event.checked;
  }

  passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get('password').value !== c.get('confirmPassword').value) {
        return {invalid: true};
    }
  }

  reset() {
    this.loginService.requestPasswordReset(this.email.toLowerCase()).then((data) => {
      this.translate.get('snackbar.successfully_reset_account').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
      this.registerUser = false;
      this.resetPassword = false;
    }).catch((e) => {
      this.translate.get('snackbar.failed_to_reset_account').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
    });
  }
  register() {
    this.loginService.createUser(this.form.value).then(() => {
      this.registerUser = false;
      this.resetPassword = false;
      this.translate.get('snackbar.successfully_created_account').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
    }).catch((e) => {
      this.translate.get('snackbar.failed_to_create_account').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
    });
  }
  updatePasswort() {
    this.loginService.updatePassword(this.form.value).then((data) => {
      console.log('successfully updated password');
      this.translate.get('snackbar.successfully_updated_password').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
      this.resetPassword = false;
    }).catch((e) => {
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
