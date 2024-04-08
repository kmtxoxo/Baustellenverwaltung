import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConstructionSite } from '../models/constructionSite';

@Injectable({
  providedIn: 'root'
})
export class ConstructionSiteService {

  baseUrl = environment.apiEndpointBaseUrl;
  constructor(private httpClient: HttpClient) {}

  async updateConstructionSite(constructionSite: ConstructionSite) {
    const result = await this.httpClient
      .put<any>(
        this.baseUrl +
          `/constructionSite/${constructionSite.id}`,
          constructionSite
      )
      .toPromise();
    return result.data;
  }

  async addConstructionSite(constructionSite: ConstructionSite) {
    const result = await this.httpClient
      .post<any>(
        this.baseUrl +
          `/constructionSite`,
          constructionSite
      )
      .toPromise();
    return result.data;
  }
  async removeConstructionSite(constructionSiteId: number) {
    const result = await this.httpClient
      .delete<any>(
        this.baseUrl +
        `/constructionSite/${constructionSiteId}`
      )
      .toPromise();
    return result.status;
  }
  async getConstructionSite() {
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
        `/constructionSite`
      )
      .toPromise();
    return result.data;
  }

  async getConstructionSiteById(constructionSiteId: any) {
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
        `/constructionSite/${constructionSiteId}`
      )
      .toPromise();
    return result.data[0];
  }
  async uploadImageToConstructionSite(constructionSiteId: number, images: any[]) {
    const formData = new FormData();
    console.log(images);
    for (const image of images) {
      formData.append('images', image);
    }

    const params = new HttpParams();
    params.append('Content-Type', 'multipart/form-data');

    const result = await this.httpClient
      .post<any>(
        this.baseUrl +
        `/constructionSite/${constructionSiteId}/image`, formData, {
          params,
          reportProgress: true,
        }
      )
      .toPromise();
    return result.data;
  }

  async getConstructionSiteImages(constructionSiteId: number) {
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
        `/constructionSite/${constructionSiteId}/image`
      )
      .toPromise();
    return result.data;
  }

  async addWorkerToConstructionSite(constructionSiteId: number, userId: number) {
    const result = await this.httpClient
      .post<any>(
        this.baseUrl +
        `/constructionSite/${constructionSiteId}/worker`, [userId]
      )
      .toPromise();
    return result.data;
  }

  async removeWorkerFromConstructionSite(constructionSiteId: number, workerId: number) {
    const result = await this.httpClient
      .delete<any>(
        this.baseUrl +
        `/constructionSite/${constructionSiteId}/worker/${workerId}`
      )
      .toPromise();
    return result.data;
  }
}
