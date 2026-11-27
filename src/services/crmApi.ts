import { Company } from '../types/company';
import { Contact } from '../types/contact';
import { apiRequest } from './apiClient';

interface ApiCompany {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
}

interface ApiContact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyId?: string | null;
}

export type CompanyInput = Omit<Company, 'id'>;
export type ContactInput = Omit<Contact, 'id'>;

function mapCompany(company: ApiCompany): Company {
  return {
    id: company.id,
    name: company.name,
    industry: company.industry ?? '',
    website: company.website ?? '',
    phone: company.phone ?? '',
    address: company.address ?? '',
  };
}

function mapContact(contact: ApiContact): Contact {
  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    companyId: contact.companyId ?? null,
  };
}

function toCompanyPayload(company: Partial<CompanyInput>): Partial<CompanyInput> {
  return {
    ...(company.name !== undefined ? { name: company.name } : {}),
    ...(company.industry !== undefined ? { industry: company.industry } : {}),
    ...(company.website !== undefined ? { website: company.website } : {}),
    ...(company.phone !== undefined ? { phone: company.phone } : {}),
    ...(company.address !== undefined ? { address: company.address } : {}),
  };
}

function toContactPayload(contact: Partial<ContactInput>): Partial<ContactInput> {
  return {
    ...(contact.firstName !== undefined ? { firstName: contact.firstName } : {}),
    ...(contact.lastName !== undefined ? { lastName: contact.lastName } : {}),
    ...(contact.email !== undefined ? { email: contact.email } : {}),
    ...(contact.phone !== undefined ? { phone: contact.phone } : {}),
    ...(contact.companyId !== undefined ? { companyId: contact.companyId } : {}),
  };
}

export const crmApi = {
  async getCompanies(): Promise<Company[]> {
    const companies = await apiRequest<ApiCompany[]>('/companies', undefined, true);
    return companies.map(mapCompany);
  },

  async createCompany(input: CompanyInput): Promise<Company> {
    return mapCompany(await apiRequest<ApiCompany>('/companies', {
      method: 'POST',
      body: JSON.stringify(toCompanyPayload(input)),
    }, true));
  },

  async updateCompany(id: string, changes: Partial<CompanyInput>): Promise<Company> {
    return mapCompany(await apiRequest<ApiCompany>(`/companies/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(toCompanyPayload(changes)),
    }, true));
  },

  async deleteCompany(id: string): Promise<void> {
    await apiRequest<{ id: string; deleted: boolean }>(`/companies/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }, true);
  },

  async getContacts(): Promise<Contact[]> {
    const contacts = await apiRequest<ApiContact[]>('/contacts', undefined, true);
    return contacts.map(mapContact);
  },

  async createContact(input: ContactInput): Promise<Contact> {
    return mapContact(await apiRequest<ApiContact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(toContactPayload(input)),
    }, true));
  },

  async updateContact(id: string, changes: Partial<ContactInput>): Promise<Contact> {
    return mapContact(await apiRequest<ApiContact>(`/contacts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(toContactPayload(changes)),
    }, true));
  },

  async deleteContact(id: string): Promise<void> {
    await apiRequest<{ id: string; deleted: boolean }>(`/contacts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }, true);
  },
};
