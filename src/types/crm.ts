export type CrmPage = 'contacts' | 'companies';

export type ContactStatus = 'Customer' | 'Lead' | 'Prospect';

export type CompanyStatus = 'Customer' | 'Prospect';

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
