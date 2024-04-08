export class Note {
  id?: number;
  title: string;
  text: string;
  constructionSiteId: number;
  modifiedAt: string;
  createdBy: {
    user: string;
    userId: number;
  };

  constructor(values: object = {}) {
    Object.assign(this, values);
  }
}
