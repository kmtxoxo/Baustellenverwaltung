export class Notification {
  id?: number;
  type: string;
  text: {de: string, en: string};
  timestamp: string;
  constructionSiteId?: number;

  constructor(values: object = {}) {
    Object.assign(this, values);
  }
}
