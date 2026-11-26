import { Company } from '../types/company';
import { Contact } from '../types/contact';

const API_BASE_URL = 'http://localhost:3001';

interface ApiError {
  success: false;
  errorCode: number;
  result: { message: string };
}

interface ApiSuccess<T> {
  success: true;
  result: T;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const body = await response.json() as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new Error(body.success ? `Request failed (${response.status})` : body.result.message);
  }

  return body.result;
}

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
    const companies = await request<ApiCompany[]>('/companies');
    return companies.map(mapCompany);
  },

  async createCompany(input: CompanyInput): Promise<Company> {
    return mapCompany(await request<ApiCompany>('/companies', {
      method: 'POST',
      body: JSON.stringify(toCompanyPayload(input)),
    }));
  },

  async updateCompany(id: string, changes: Partial<CompanyInput>): Promise<Company> {
    return mapCompany(await request<ApiCompany>(`/companies/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(toCompanyPayload(changes)),
    }));
  },

  async deleteCompany(id: string): Promise<void> {
    await request<{ id: string; deleted: boolean }>(`/companies/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async getContacts(): Promise<Contact[]> {
    const contacts = await request<ApiContact[]>('/contacts');
    return contacts.map(mapContact);
  },

  async createContact(input: ContactInput): Promise<Contact> {
    return mapContact(await request<ApiContact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(toContactPayload(input)),
    }));
  },

  async updateContact(id: string, changes: Partial<ContactInput>): Promise<Contact> {
    return mapContact(await request<ApiContact>(`/contacts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(toContactPayload(changes)),
    }));
  },

  async deleteContact(id: string): Promise<void> {
    await request<{ id: string; deleted: boolean }>(`/contacts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
