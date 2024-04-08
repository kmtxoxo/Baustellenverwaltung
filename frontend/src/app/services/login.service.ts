import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserRegistration } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  baseUrl = environment.apiEndpointBaseUrl;

  constructor(private httpClient: HttpClient) {
    if (localStorage.getItem('token')) {
      this.loggedIn.next(true);
    }
  }


  setLoggedInState(state: boolean) {
    this.loggedIn.next(state);
  }

  async createUser(user: UserRegistration) {
    const result = await this.httpClient.post<any>(this.baseUrl + '/user',
        {
          email: user.email,
          name: user.name,
          address: user.address,
          zip: user.zip,
          city: user.city,
          language: user.language,
          password: user.password,
          verificationId: user.verificationId
        }
      ).toPromise();
    return result.data;
  }

  async requestPasswordReset(email: string) {
    const result = await this.httpClient.post<any>(this.baseUrl + '/account/reset', {email}).toPromise();
    return result.data;
  }

  async updatePassword(data: {password: string, resetId: string}) {
    const result = await this.httpClient.put<any>(this.baseUrl + '/account/password', data).toPromise();
    return result.data;
  }


  async login(email: string, password: string) {
    const result = await this.httpClient.post<any>(this.baseUrl + '/account/login', {email, password}).toPromise();
    return result.data;
  }

  async logout() {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
  }
}
