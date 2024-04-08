export class Material {
  id?: number;
  name: string;
  amount: number;
  unit?: string;
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
