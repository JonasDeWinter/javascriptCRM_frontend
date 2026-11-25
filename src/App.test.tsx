import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { deleteCompanies, updateCompany } from './store/company/companySlice';
import { updateContact } from './store/contact/contactSlice';
import { createAppStore } from './store/store';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

function renderApp() {
  return render(
    <Provider store={createAppStore()}>
      <App />
    </Provider>
  );
}

test('renders contacts and navigates to companies', () => {
  renderApp();

  expect(screen.getByRole('heading', { level: 1, name: /contacts/i })).toBeInTheDocument();
  expect(screen.getAllByText('Olivia Rhye').length).toBeGreaterThan(0);

  fireEvent.click(screen.getByRole('button', { name: /companies/i }));

  expect(screen.getByRole('heading', { level: 1, name: /companies/i })).toBeInTheDocument();
  expect(screen.getByText('Untitled UI')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/companies');
});

test('opens the page that matches the current URL', () => {
  window.history.replaceState({}, '', '/companies');
  renderApp();

  expect(screen.getByRole('heading', { level: 1, name: /companies/i })).toBeInTheDocument();
});

test('adds a contact to the startup data', () => {
  renderApp();
  fireEvent.click(screen.getAllByRole('button', { name: /add contact/i })[0]);
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Jamie Lee' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jamie@example.com' } });
  fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'company-1' } });
  fireEvent.change(screen.getByLabelText('Job title'), { target: { value: 'Designer' } });
  fireEvent.click(screen.getAllByRole('button', { name: /add contact/i })[1]);

  expect(screen.getByText('Jamie Lee')).toBeInTheDocument();
  expect(screen.getAllByText('Lead').length).toBeGreaterThan(1);
});

test('uses the companies page context for the record modal', () => {
  window.history.replaceState({}, '', '/companies');
  renderApp();
  fireEvent.click(screen.getAllByRole('button', { name: /add company/i })[0]);
  fireEvent.change(screen.getByLabelText('Company name'), { target: { value: 'Acme Labs' } });
  fireEvent.change(screen.getByLabelText('Industry'), { target: { value: 'Technology' } });
  fireEvent.click(screen.getAllByRole('button', { name: /add company/i })[1]);

  expect(screen.getByText('Acme Labs')).toBeInTheDocument();
});

test('opens contact details and shows its company association', () => {
  renderApp();

  fireEvent.click(screen.getByRole('button', { name: 'View details for Olivia Rhye' }));

  expect(window.location.pathname).toBe('/contacts/contact-1');
  expect(screen.getByRole('heading', { level: 1, name: 'Olivia Rhye' })).toBeInTheDocument();
  expect(screen.getByText('Untitled UI', { selector: '.associated-company strong' })).toBeInTheDocument();
  expect(screen.getByText('Associated contacts').parentElement?.textContent).toContain('2');
});

test('opens company details and lists its associated contacts', () => {
  window.history.replaceState({}, '', '/companies');
  renderApp();

  fireEvent.click(screen.getByRole('button', { name: 'View details for Untitled UI' }));

  expect(window.location.pathname).toBe('/companies/company-1');
  expect(screen.getByRole('heading', { level: 1, name: 'Untitled UI' })).toBeInTheDocument();
  expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  expect(screen.getByText('$12.4M')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'View details for Olivia Rhye' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'View details for Grace Hall' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'View details for Grace Hall' }));
  expect(window.location.pathname).toBe('/contacts/contact-7');
});

test('shows the save button only while contact edits differ from saved values', () => {
  renderApp();
  fireEvent.click(screen.getByRole('button', { name: 'View details for Olivia Rhye' }));

  const nameInput = screen.getByLabelText('Full name');
  fireEvent.change(nameInput, { target: { value: 'Olivia R.' } });
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();

  fireEvent.change(nameInput, { target: { value: 'Olivia Rhye' } });
  expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
});

test('saves edited contact fields to Redux', () => {
  renderApp();
  fireEvent.click(screen.getByRole('button', { name: 'View details for Olivia Rhye' }));
  fireEvent.change(screen.getByLabelText('Contact owner'), { target: { value: 'Demi Wilkinson' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

  expect(screen.getByLabelText('Contact owner')).toHaveValue('Demi Wilkinson');
  expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
});

test('updates contacts and companies through Redux actions', () => {
  const store = createAppStore();
  store.dispatch(updateContact({
    id: 'contact-1',
    changes: { title: 'Senior Product Designer' },
  }));
  store.dispatch(updateCompany({
    id: 'company-1',
    changes: { industry: 'Product Design' },
  }));

  expect(store.getState().contacts[0].title).toBe('Senior Product Designer');
  expect(store.getState().companies[0].industry).toBe('Product Design');
});

test('clears company associations when a company is deleted', () => {
  const store = createAppStore();
  store.dispatch(deleteCompanies(['company-1']));

  expect(store.getState().contacts.find((contact) => contact.id === 'contact-1')?.companyId).toBeNull();
  expect(store.getState().contacts.find((contact) => contact.id === 'contact-7')?.companyId).toBeNull();
});

test('deletes a selected contact after confirmation', () => {
  const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  renderApp();

  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Olivia Rhye' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete 1 selected contacts' }));

  expect(confirmSpy).toHaveBeenCalled();
  expect(screen.queryByText('olivia@untitledui.com')).not.toBeInTheDocument();
  confirmSpy.mockRestore();
});

test('deletes a selected company after confirmation', () => {
  const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  window.history.replaceState({}, '', '/companies');
  renderApp();

  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Untitled UI' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete 1 selected companies' }));

  expect(confirmSpy).toHaveBeenCalled();
  expect(screen.queryByText('San Francisco, CA')).not.toBeInTheDocument();
  confirmSpy.mockRestore();
});
