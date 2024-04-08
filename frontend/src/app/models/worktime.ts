export class Worktime {
  id?: number;
  hours: number;
  minutes: number;
  start: Date;
  end: Date;
  constructionSiteId: number;
  text: string;
  modifiedAt: string;

  createdBy: {
    user: string;
    userId: number;
  };

  constructor(values: object = {}) {
    Object.assign(this, values);
  }
}
