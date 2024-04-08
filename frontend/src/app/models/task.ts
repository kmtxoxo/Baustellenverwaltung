export class Task {
  id?: number;
  title: string;
  text: string;
  constructionSiteId: number;
  modifiedAt: string;
  createdAt: string;
  status: 'open' | 'in_progress' | 'completed';
  priority: 'low' | 'high' | 'normal';
  assignedTo: {
    user: string;
    userId: number;
  };
  createdBy: {
    user: string;
    userId: number;
  };

  constructor(values: object = {}) {
    Object.assign(this, values);
  }
}
