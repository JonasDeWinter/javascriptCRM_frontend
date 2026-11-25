import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import RecordModal from './components/ui/RecordModal';
import { ModalProvider } from './contexts/ModalContext';
import { deleteCompanies } from './store/company/companySlice';
import { deleteContacts } from './store/contact/contactSlice';
import CompaniesPage from './features/companies/CompaniesPage';
import ContactsPage from './features/contacts/ContactsPage';
import ContactDetailsPage from './features/contacts/ContactDetailsPage';
import { CrmPage } from './types/crm';
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
import useModalContext from './hooks/useModalContext';
import './styles/App.css';

function CrmApp() {
  const [search, setSearch] = useState('');
  const { isModalOpen } = useModalContext();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const contacts = useAppSelector((state) => state.contacts);
  const companies = useAppSelector((state) => state.companies);
  const page: CrmPage = location.pathname === '/companies' ? 'companies' : 'contacts';

  const pageTitle = page === 'contacts' ? 'Contacts' : 'Companies';

  return (
    <AppLayout
      activePage={page}
      contactCount={contacts.length}
      companyCount={companies.length}
      onNavigate={(nextPage) => {
        navigate(nextPage === 'contacts' ? '/contacts' : '/companies');
        setSearch('');
      }}
      pageTitle={pageTitle}
      search={search}
      onSearchChange={setSearch}
    >
      <Routes>
        <Route
          path="/contacts"
          element={
            <ContactsPage
              contacts={contacts}
              companies={companies}
              search={search}
              onDeleteSelected={(ids) => dispatch(deleteContacts(ids))}
            />
          }
        />
        <Route
          path="/contacts/:contactId"
          element={<ContactDetailsPage contacts={contacts} companies={companies} />}
        />
        <Route
          path="/companies"
          element={
            <CompaniesPage
              companies={companies}
              contacts={contacts}
              search={search}
              onDeleteSelected={(ids) => dispatch(deleteCompanies(ids))}
            />
          }
        />
        <Route path="*" element={<Navigate to="/contacts" replace />} />
      </Routes>
      {isModalOpen && (
        <RecordModal
          companies={companies}
        />
      )}
    </AppLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ModalProvider>
        <CrmApp />
      </ModalProvider>
    </BrowserRouter>
  );
}

export default App;
