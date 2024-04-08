import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {


  baseUrl = environment.apiEndpointBaseUrl;
  constructor(private httpClient: HttpClient) {}

  async getPermissions() {
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
          `/permission`
      )
      .toPromise();
    return result.data;
  }
}
