import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  baseUrl = environment.apiEndpointBaseUrl;
  constructor(private httpClient: HttpClient) {}

  async getNotifications() {
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
          `/notification`
      )
      .toPromise();
    return result.data;
  }

}
