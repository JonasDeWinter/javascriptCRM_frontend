export enum ContactStatus {
  Customer = 'Customer',
  Lead = 'Lead',
  Prospect = 'Prospect'
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  companyId: string | null;
  title: string;
  status: ContactStatus;
  owner: string;
  lastContacted: string;
}
