export enum CompanyStatus {
  Customer = 'Customer',
  Prospect = 'Prospect'
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
