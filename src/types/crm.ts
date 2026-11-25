export enum CrmPage {
  Contacts = 'contacts',
  Companies = 'companies'
}

export enum ContactStatus {
  Customer = 'Customer',
  Lead = 'Lead',
  Prospect = 'Prospect'
}

export enum CompanyStatus {
  Customer = 'Customer',
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

export interface Company {
  id: string;
  name: string;
  industry: string;
  employees: string;
  location: string;
  annualRevenue: string;
  status: CompanyStatus;
}
