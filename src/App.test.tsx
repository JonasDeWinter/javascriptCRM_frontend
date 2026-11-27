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
let rejectProtectedRequests: boolean;
let fetchSpy: jest.SpyInstance;

function jsonResponse(result: unknown, status = 200, message = 'Backend unavailable'): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => status >= 400
      ? { success: false, errorCode: status, result: { message } }
      : { success: true, result },
  } as Response;
}

function mockBackendFetch(url: string, init?: RequestInit): Promise<Response> {
  const path = new URL(url).pathname;
  const method = init?.method ?? 'GET';
  const body = init?.body ? JSON.parse(String(init.body)) : {};
  const authorization = new Headers(init?.headers).get('Authorization');

  if (path === '/auth/login' && method === 'POST') {
    return Promise.resolve(body.username === 'taylor' && body.password === 'a-long-unique-password'
      ? jsonResponse({ token: 'test-auth-token', tokenType: 'Bearer', expiresIn: 3600 })
      : jsonResponse(null, 401, 'Invalid username or password'));
  }
  if (path === '/auth/register' && method === 'POST') {
    return Promise.resolve(jsonResponse({ id: 'user-1', username: body.username, email: body.email }, 201));
  }

  if (
    (path.startsWith('/companies') || path.startsWith('/contacts'))
    && (rejectProtectedRequests || authorization !== 'Bearer test-auth-token')
  ) {
    return Promise.resolve(jsonResponse(null, 401, 'Unauthorized'));
  }

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

async function signIn() {
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'taylor' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'a-long-unique-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument());
}

async function renderAuthenticatedApp() {
  renderApp();
  await signIn();
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
  rejectProtectedRequests = false;
  window.sessionStorage.clear();
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation((input, init) => (
    mockBackendFetch(String(input), init)
  ));
});

afterEach(() => {
  fetchSpy.mockRestore();
});

test('requires login and sends the auth token with protected requests', async () => {
  renderApp();

  expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/login');
  expect(fetchSpy).not.toHaveBeenCalledWith('http://localhost:3001/contacts', expect.anything());
  await signIn();
  expect(await screen.findByText('Olivia Rhye')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /companies/i }));

  expect(await screen.findByText('Acme Inc.')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/companies');
  expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/contacts', expect.anything());
  expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/companies', expect.anything());
  const protectedRequest = fetchSpy.mock.calls.find(([url]) => url === 'http://localhost:3001/contacts');
  expect(new Headers(protectedRequest?.[1]?.headers).get('Authorization')).toBe('Bearer test-auth-token');
});

test('shows the login screen when visiting /login directly', () => {
  window.history.replaceState({}, '', '/login');
  renderApp();

  expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/login');
  expect(fetchSpy).not.toHaveBeenCalledWith('http://localhost:3001/contacts', expect.anything());
});

test('shows the credential error when login is rejected', async () => {
  renderApp();
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'taylor' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Could not log in with the provided user credentials'
  );
  expect(window.location.pathname).toBe('/login');
});

test('registers an account and returns to the login form', async () => {
  renderApp();
  fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));
  fireEvent.change(screen.getAllByLabelText('Username')[1], { target: { value: 'taylor' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'taylor@example.com' } });
  fireEvent.change(screen.getByLabelText('Password (12–72 characters)'), { target: { value: 'a-long-unique-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

  expect(await screen.findByRole('status')).toHaveTextContent('Account created');
  expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/auth/register', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({
      username: 'taylor',
      email: 'taylor@example.com',
      password: 'a-long-unique-password',
    }),
  }));
  expect(fetchSpy).not.toHaveBeenCalledWith('http://localhost:3001/contacts', expect.anything());
});

test('returns to login when a protected API request rejects the token', async () => {
  rejectProtectedRequests = true;
  renderApp();
  await signIn();

  expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  expect(screen.queryByText('Olivia Rhye')).not.toBeInTheDocument();
  expect(window.sessionStorage.getItem('crm-auth')).toBeNull();
});

test('signs out and clears the authenticated session', async () => {
  await renderAuthenticatedApp();
  fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));

  expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  expect(window.sessionStorage.getItem('crm-auth')).toBeNull();
  expect(screen.queryByText('Olivia Rhye')).not.toBeInTheDocument();
});

test('creates a contact using the backend contact contract', async () => {
  await renderAuthenticatedApp();
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
  expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/login');
  await signIn();
  expect(window.location.pathname).toBe('/companies');
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
  await renderAuthenticatedApp();
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
  await renderAuthenticatedApp();
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
  await renderAuthenticatedApp();
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
  await renderAuthenticatedApp();

  expect(await screen.findByRole('alert')).toHaveTextContent('Backend unavailable');
  expect(screen.queryByText('Olivia Rhye')).not.toBeInTheDocument();
});
