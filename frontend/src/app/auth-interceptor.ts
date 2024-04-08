import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { LoginService } from './services/login.service';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private loginService: LoginService, private router: Router) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let authReq = req;
    const token = localStorage.getItem('token');
    if (token != null) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + token),
      });
    }

    return next.handle(authReq).pipe(
      tap(
        () => {},
        (err: any) => {
          console.log(err);
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this.loginService.logout();
            }
          }
        }
      )
    );
  }
}
