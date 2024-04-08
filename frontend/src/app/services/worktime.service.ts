import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { Worktime } from '../models/worktime';

@Injectable({
  providedIn: 'root'
})
export class WorktimeService {

  baseUrl = environment.apiEndpointBaseUrl;
  constructor(private httpClient: HttpClient) {}

  async updateConstructionSiteWorktime(worktime: Worktime) {
    const result = await this.httpClient
      .put<any>(
        this.baseUrl +
          `/constructionSite/${worktime.constructionSiteId}/worktime/${worktime.id}`,
          worktime
      )
      .toPromise();
    return result.data;
  }
  async addConstructionSiteWorktime(worktime: Worktime) {
    console.log(worktime);
    const result = await this.httpClient
      .post<any>(
        this.baseUrl +
          `/constructionSite/${worktime.constructionSiteId}/worktime`,
          worktime
      )
      .toPromise();
    return result.data;
  }
  async deleteConstructionSiteWorktime(worktime: Worktime) {
    const result = await this.httpClient
      .delete<any>(
        this.baseUrl +
          `/constructionSite/${worktime.constructionSiteId}/worktime/${worktime.id}`
      )
      .toPromise();
    return result.status;
  }
  async getConstructionSiteWorktime(constructionSiteId: number, csv?: boolean) {
    const headers = new HttpHeaders();
    if (!csv) {
      const result = await this.httpClient
      .get<any>(
        this.baseUrl +
          `/constructionSite/${constructionSiteId}/worktime`
      )
      .toPromise();
      return result.data as any;
    } else {
      const options = {
        headers: new HttpHeaders({
          Accept: 'text/csv'
        }),
        responseType: 'text/csv' as 'text'
      };
      const result = await this.httpClient
        .get(
          this.baseUrl +
            `/constructionSite/${constructionSiteId}/worktime`, options
        )
        .toPromise();
      return result;
    }

  }

  async getWorktimeByUserIds(users: User[], from?: Date, to?: Date) {
    let params = new HttpParams();

    // Begin assigning parameters
    if (from) {
      params = params.append('from', from.toISOString());
    }
    if (to) {
      params = params.append('to', to.toISOString());
    }

    for (const user of users) {
      params = params.append('users[]', user.id.toString());
    }
    const options = {
      headers: new HttpHeaders({
        Accept: 'text/csv',
      }),
      params,
      responseType: 'text/csv' as  any
    };

    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
          `/worktime`, options
      )
      .toPromise();
    return result;
  }

  async getWorktimeByUserId(userId: number, from?: Date, to?: Date) {
    let params = new HttpParams();

    // Begin assigning parameters
    if (from) {
      params = params.append('from', from.toISOString());
    }
    if (to) {
      params = params.append('to', to.toISOString());
    }
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
          `/user/${userId}/worktime`, {params}
      )
      .toPromise();
    return result.data;
  }
}
