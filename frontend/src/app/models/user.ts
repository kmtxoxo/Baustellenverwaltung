export class User {
  id: number;
  name: string;
  email: string;
  address: string;
  zip: number;
  city: string;
  phone: number;
  language: string;
  status: string;
  role: string;
  permissions?: {
    note: {
      read: boolean,
      write: boolean
    },
    task: {
      read: boolean,
      write: boolean
    },
    users: {
      read: boolean,
      write: boolean
    },
    material: {
      read: boolean,
      write: boolean
    },
    worktime: {
      read: boolean,
      write: boolean
    },
    imageUpload: {
      read: boolean,
      write: boolean
    },
    notification: {
      read: boolean
    },
    constructionSite: {
      read: boolean,
      write: boolean
    }
  };
  constructor(values: object = {}) {
    Object.assign(this, values);
  }
}

export interface UserRegistration {
  email: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  language: string;
  password: string;
  verificationId: string;
}

export interface Worker {
  userId?: number;
  id: number;
  name: string;
  workeremail?: string;
  workername?: string;
}
