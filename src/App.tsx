import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import RecordModal from './components/ui/RecordModal';
import { ModalProvider } from './contexts/ModalContext';
import { deleteCompanies } from './store/company/companySlice';
import { deleteContacts } from './store/contact/contactSlice';
import CompaniesPage from './pages/companies/CompaniesPage';
import CompanyDetailsPage from './pages/companies/CompanyDetailsPage';
import ContactsPage from './pages/contacts/ContactsPage';
import ContactDetailsPage from './pages/contacts/ContactDetailsPage';
import { CrmPage } from './types/crm';
import { useAppDispatch } from './hooks/reduxHooks';
import { useCompanyData } from './hooks/CompanyHooks';
import { useContactData } from './hooks/ContactHooks';
import useModalContext from './hooks/useModalContext';
import './styles/App.css';

function CrmApp() {
  const [search, setSearch] = useState('');
  const { isModalOpen } = useModalContext();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const page = location.pathname.startsWith(`/${CrmPage.Companies}`)
    ? CrmPage.Companies
    : CrmPage.Contacts;

  const pageTitle = page === CrmPage.Contacts ? 'Contacts' : 'Companies';

  return (
    <AppLayout
      activePage={page}
      onNavigate={(nextPage) => {
        navigate(`/${nextPage}`);
        setSearch('');
      }}
      pageTitle={pageTitle}
      search={search}
      onSearchChange={setSearch}
    >
      <Routes>
        <Route
          path={`/${CrmPage.Contacts}`}
          element={
            <ContactsPage
              search={search}
              onDeleteSelected={(ids) => dispatch(deleteContacts(ids))}
            />
          }
        />
        <Route
          path={`/${CrmPage.Contacts}/:contactId`}
          element={<ContactDetailsPage />}
        />
        <Route
          path={`/${CrmPage.Companies}`}
          element={
            <CompaniesPage
              search={search}
              onDeleteSelected={(ids) => dispatch(deleteCompanies(ids))}
            />
          }
        />
        <Route
          path={`/${CrmPage.Companies}/:companyId`}
          element={<CompanyDetailsPage />}
        />
        <Route path="*" element={<Navigate to={`/${CrmPage.Contacts}`} replace />} />
      </Routes>
      {isModalOpen && (
        <RecordModal />
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
