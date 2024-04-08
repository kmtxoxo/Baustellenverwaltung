import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { parseJwt } from '../helper/jsonwebtokenDecoder';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl = environment.apiEndpointBaseUrl;
  profilePromise: any;
  loadedProfileAt = 0;
  constructor(private httpClient: HttpClient) {}

  async updateUser(user: User) {
    if (user.id == this.getOwnUserId()) {
      this.loadedProfileAt = 0;
    }
    const result = await this.httpClient
      .put<any>(
        this.baseUrl +
          `/user/${user.id}`,
        user
      )
      .toPromise();
    return result.data;
  }

  async updatePassword(password: string, userId: number) {
    const result = await this.httpClient
      .put<any>(
        this.baseUrl +
          `/user/${userId}`,
        {password}
      )
      .toPromise();
    return result.data;
  }

  async inviteUser(user: {name: string, email: string, role: string}) {
    const result = await this.httpClient
      .post<any>(
        this.baseUrl +
          `/account/invite`,
        user
      )
      .toPromise();

    return result.data;
  }

  async getUsers() {
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
          `/user`
      )
      .toPromise();
    return result.data;
  }

  async deleteUser(userId: number) {
    const result = await this.httpClient
      .delete<any>(
        this.baseUrl +
          `/user/${userId}`
      )
      .toPromise();
    return result.status;
  }

  async getProfile() {
    if (this.profilePromise == null || this.loadedProfileAt + 5 * 60000 < new Date().getTime()) {
      this.loadedProfileAt = new Date().getTime();
      const ownUserId = parseJwt(localStorage.getItem('token')).userId;
      this.profilePromise = await this.httpClient
        .get<any>(
          this.baseUrl +
            `/user/${ownUserId}`
        )
      .toPromise();
    }
    return this.profilePromise.data[0];
  }

  getOwnUserId() {
    return parseJwt(localStorage.getItem('token')).userId;
  }
}
