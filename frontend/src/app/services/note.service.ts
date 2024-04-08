import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Note } from '../models/note';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  baseUrl = environment.apiEndpointBaseUrl;
  constructor(private httpClient: HttpClient) {}

  async getConstructionSiteNote(constructionSiteId: number) {
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
          `/constructionSite/${constructionSiteId}/note`
      )
      .toPromise();
    return result.data;
  }

  async addConstructionSiteNote(note: Note) {
    const result = await this.httpClient
      .post<any>(
        this.baseUrl +
          `/constructionSite/${note.constructionSiteId}/note`, note
      )
      .toPromise();
    return result.data;
  }

  async updateConstructionSiteNote(note: Note) {
    const result = await this.httpClient
      .put<any>(
        this.baseUrl +
          `/constructionSite/${note.constructionSiteId}/note/${note.id}`, note
      )
      .toPromise();
    return result.data;
  }

  async removeConstructionSiteNote(constructionSiteId: number, noteId: number) {
    const result = await this.httpClient
      .delete<any>(
        this.baseUrl +
          `/constructionSite/${constructionSiteId}/note/${noteId}`
      )
      .toPromise();
    return result.status;
  }

}
