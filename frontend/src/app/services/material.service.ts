import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Material } from '../models/material';

export interface MaterialAutocomplete {
  _id: 'autocomplete:materialien';
  material: string[];
}

export interface EinheitAutocomplete {
  _id: 'autocomplete:einheiten';
  einheiten: string[];
}

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  einheitenAC: EinheitAutocomplete = {
    _id: 'autocomplete:einheiten',
    einheiten: [],
  };
  materialienAC: MaterialAutocomplete = {
    _id: 'autocomplete:materialien',
    material: [],
  };
  baseUrl = environment.apiEndpointBaseUrl;
  constructor(private httpClient: HttpClient) {}

  async updateMaterial(material: Material) {
    const result = await this.httpClient
      .put<any>(
        this.baseUrl +
          `/constructionSite/${material.constructionSiteId}/material/${material.id}`,
        material
      )
      .toPromise();
    return result.data;
  }
  async addMaterial(material: Material) {
    const result = await this.httpClient
      .post<any>(
        this.baseUrl +
          `/constructionSite/${material.constructionSiteId}/material`,
        material
      )
      .toPromise();
    return result.data;
  }

  async removeConstructionSiteMaterial(
    constructionSiteId: number,
    materialId: number
  ) {
    const result = await this.httpClient
      .delete<any>(
        this.baseUrl +
          `/constructionSite/${constructionSiteId}/material/${materialId}`
      )
      .toPromise();
    return result.status;
  }

  async getConstructionSiteMatieral(constructionSiteId: number, csv?: boolean) {

    if (!csv) {
      const result = await this.httpClient
      .get(
        this.baseUrl + `/constructionSite/${constructionSiteId}/material`,
      )
      .toPromise() as any;
      return result.data;
    } else {

      const options = {
        headers: new HttpHeaders({
          Accept: 'text/csv'
        }),
        responseType: 'text/csv' as 'text'
      };
      const result = await this.httpClient
        .get(
          this.baseUrl + `/constructionSite/${constructionSiteId}/material`, options
        )
        .toPromise();
      return result;
    }

  }

  // Konzept frage: autocomplete über alle nutzer gleich oder pro nutzer eigenes autocomplete
  // wenn ja muss id auch nutzerid enthalten

  async removeAutocompleteMaterial(material: string) {
    const result = await this.httpClient
    .delete<any>(
      this.baseUrl + `/material/${material}`
    )
    .toPromise();
    return result.status;
  }


  async removeAutocompleteEinheit(unit: string) {
    const result = await this.httpClient
      .delete<any>(
        this.baseUrl + `/unit/${unit}`
      )
      .toPromise();
    return result.status;
  }

  async getMaterialAutocomplete(value: string) {
    let params = new HttpParams();
    params = params.append('key', value);
    const result = await this.httpClient
      .get<any>(
        this.baseUrl + `/material`, {params}
      )
      .toPromise();
    return result.data;
  }

  async getEinheitenAutocomplete(value: string)  {
    let params = new HttpParams();
    params = params.append('key', value);
    const result = await this.httpClient
      .get<any>(
        this.baseUrl + `/unit`, {params}
      )
      .toPromise();
    return result.data;
  }
}
