import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { createAppStore } from './store/store';

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

let companies: ApiCompany[];
let contacts: ApiContact[];
let failContactListRequest: boolean;
let fetchSpy: jest.SpyInstance;

function jsonResponse(result: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => status >= 400
      ? { success: false, errorCode: status, result: { message: 'Backend unavailable' } }
      : { success: true, result },
  } as Response;
}

function mockBackendFetch(url: string, init?: RequestInit): Promise<Response> {
  const path = new URL(url).pathname;
  const method = init?.method ?? 'GET';
  const body = init?.body ? JSON.parse(String(init.body)) : {};

  if (path === '/companies' && method === 'GET') return Promise.resolve(jsonResponse(companies));
  if (path === '/contacts' && method === 'GET') {
    return Promise.resolve(failContactListRequest
      ? jsonResponse(null, 500)
      : jsonResponse(contacts));
  }
  if (path === '/companies' && method === 'POST') {
    const company = { id: `company-${companies.length + 1}`, ...body };
    companies.push(company);
    return Promise.resolve(jsonResponse(company, 201));
  }
  if (path === '/contacts' && method === 'POST') {
    const contact = { id: `contact-${contacts.length + 1}`, ...body };
    contacts.push(contact);
    return Promise.resolve(jsonResponse(contact, 201));
  }

  const companyMatch = path.match(/^\/companies\/(.+)$/);
  if (companyMatch && method === 'PATCH') {
    const company = companies.find((item) => item.id === decodeURIComponent(companyMatch[1]));
    if (!company) return Promise.resolve(jsonResponse({ message: 'Company not found' }, 404));
    Object.assign(company, body);
    return Promise.resolve(jsonResponse(company));
  }
  if (companyMatch && method === 'DELETE') {
    const id = decodeURIComponent(companyMatch[1]);
    companies = companies.filter((item) => item.id !== id);
    contacts.forEach((contact) => {
      if (contact.companyId === id) contact.companyId = null;
    });
    return Promise.resolve(jsonResponse({ id, deleted: true }));
  }

  const contactMatch = path.match(/^\/contacts\/(.+)$/);
  if (contactMatch && method === 'PATCH') {
    const contact = contacts.find((item) => item.id === decodeURIComponent(contactMatch[1]));
    if (!contact) return Promise.resolve(jsonResponse({ message: 'Contact not found' }, 404));
    Object.assign(contact, body);
    return Promise.resolve(jsonResponse(contact));
  }
  if (contactMatch && method === 'DELETE') {
    const id = decodeURIComponent(contactMatch[1]);
    contacts = contacts.filter((item) => item.id !== id);
    return Promise.resolve(jsonResponse({ id, deleted: true }));
  }

  return Promise.resolve(jsonResponse({ message: 'Not found' }, 404));
}

function renderApp() {
  return render(
    <Provider store={createAppStore()}>
      <App />
    </Provider>
  );
}

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  companies = [
    { id: 'company-1', name: 'Acme Inc.', industry: 'Software', address: 'San Francisco' },
  ];
  contacts = [
    { id: 'contact-1', firstName: 'Olivia', lastName: 'Rhye', email: 'olivia@example.com', phone: '555-0100', companyId: 'company-1' },
  ];
  failContactListRequest = false;
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation((input, init) => (
    mockBackendFetch(String(input), init)
  ));
});

afterEach(() => {
  fetchSpy.mockRestore();
});

test('loads backend records and navigates to companies', async () => {
  renderApp();

  expect(await screen.findByText('Olivia Rhye')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /companies/i }));

  expect(await screen.findByText('Acme Inc.')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/companies');
  expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/contacts', expect.anything());
  expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/companies', expect.anything());
});

test('creates a contact using the backend contact contract', async () => {
  renderApp();
  await screen.findByText('Olivia Rhye');
  fireEvent.click(screen.getAllByRole('button', { name: /add contact/i })[0]);
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jamie' } });
  fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Lee' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jamie@example.com' } });
  fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'company-1' } });
  fireEvent.click(screen.getAllByRole('button', { name: /add contact/i })[1]);

  expect(await screen.findByText('Jamie Lee')).toBeInTheDocument();
  expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/contacts', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Jamie',
      lastName: 'Lee',
      email: 'jamie@example.com',
      phone: '',
      companyId: 'company-1',
    }),
  }));
});

test('creates a company using backend-supported fields', async () => {
  window.history.replaceState({}, '', '/companies');
  renderApp();
  await screen.findByText('Acme Inc.');
  fireEvent.click(screen.getAllByRole('button', { name: /add company/i })[0]);
  fireEvent.change(screen.getByLabelText('Company name'), { target: { value: 'Northwind' } });
  fireEvent.change(screen.getByLabelText('Industry'), { target: { value: 'Retail' } });
  fireEvent.change(screen.getByLabelText('Website'), { target: { value: 'https://northwind.example' } });
  fireEvent.click(screen.getAllByRole('button', { name: /add company/i })[1]);

  expect(await screen.findByText('Northwind')).toBeInTheDocument();
  expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/companies', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({
      name: 'Northwind',
      industry: 'Retail',
      website: 'https://northwind.example',
      phone: '',
      address: '',
    }),
  }));
});

test('updates a contact through PATCH and reflects the backend response', async () => {
  renderApp();
  fireEvent.click(await screen.findByRole('button', { name: 'View details for Olivia Rhye' }));
  fireEvent.change(await screen.findByLabelText('First name'), { target: { value: 'Liv' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Liv Rhye' })).toBeInTheDocument());
  expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/contacts/contact-1', expect.objectContaining({
    method: 'PATCH',
    body: JSON.stringify({ firstName: 'Liv' }),
  }));
});

test('deletes a company and clears its contact associations from backend results', async () => {
  const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  window.history.replaceState({}, '', '/companies');
  renderApp();
  await screen.findByText('Acme Inc.');
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Acme Inc.' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete 1 selected companies' }));

  await waitFor(() => expect(screen.queryByText('Acme Inc.')).not.toBeInTheDocument());
  expect(contacts[0].companyId).toBeNull();
  expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/companies/company-1', expect.objectContaining({
    method: 'DELETE',
  }));
  confirmSpy.mockRestore();
});

test('deletes a selected contact through the backend', async () => {
  const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  renderApp();
  await screen.findByText('Olivia Rhye');
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Olivia Rhye' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete 1 selected contacts' }));

  await waitFor(() => expect(screen.queryByText('Olivia Rhye')).not.toBeInTheDocument());
  expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/contacts/contact-1', expect.objectContaining({
    method: 'DELETE',
  }));
  confirmSpy.mockRestore();
});

test('shows backend request errors instead of falling back to local data', async () => {
  failContactListRequest = true;
  renderApp();

  expect(await screen.findByRole('alert')).toHaveTextContent('Backend unavailable');
  expect(screen.queryByText('Olivia Rhye')).not.toBeInTheDocument();
});
