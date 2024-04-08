export class Contact {
  zip?: string;
  address?: string;
  city?: number;
  phone?: string;
  name?: number;
  email?: string;

  constructor(values: object = {}) {
    Object.assign(this, values);
  }
}
