import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  baseUrl = environment.apiEndpointBaseUrl;
  constructor(private httpClient: HttpClient) {}

  async getConstructionSiteTasks(constructionSiteId: number) {
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
          `/constructionSite/${constructionSiteId}/task`
      )
      .toPromise();
    return result.data;
  }

  async getAllTasks() {
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
          `/task`
      )
      .toPromise();
    return result.data;
  }

  async getTasksbyUserId(userId: number) {
    const result = await this.httpClient
      .get<any>(
        this.baseUrl +
          `/user/${userId}/task`
      )
      .toPromise();
    return result.data;
  }

  async addConstructionSiteTask(task: Task) {
    const result = await this.httpClient
      .post<any>(
        this.baseUrl +
          `/constructionSite/${task.constructionSiteId}/task`, task
      )
      .toPromise();
    return result.data;
  }

  async updateConstructionSiteTask(task: Task, taskId: number) {
    const result = await this.httpClient
      .put<any>(
        this.baseUrl +
          `/constructionSite/${task.constructionSiteId}/task/${taskId}`, task
      )
      .toPromise();
    return result.data;
  }

  async removeConstructionSiteTask(constructionSiteId: number, taskId: number) {
    const result = await this.httpClient
      .delete<any>(
        this.baseUrl +
          `/constructionSite/${constructionSiteId}/task/${taskId}`
      )
      .toPromise();
    return result.status;
  }
}
