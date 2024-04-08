import { Contact } from './contact';
import { Worker } from './user';

export class ConstructionSite {
  id?: number;
  name: string;
  contact?: Contact;
  status?: 'open' | 'completed';
  modifiedAt: string;
  users: Worker[];
  createdBy: {
    user: string;
    userId: number;
  };
  constructor(values: object = {}) {
    Object.assign(this, values);
  }
}
