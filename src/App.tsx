import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Popup from './components/ui/Popup';
import RecordForm from './components/ui/RecordForm';
import { deleteCompanies, fetchCompanies } from './store/company/companySlice';
import { deleteContacts, fetchContacts } from './store/contact/contactSlice';
import CompaniesPage from './pages/companies/CompaniesPage';
import CompanyDetailsPage from './pages/companies/CompanyDetailsPage';
import ContactsPage from './pages/contacts/ContactsPage';
import ContactDetailsPage from './pages/contacts/ContactDetailsPage';
import { CrmPage } from './types/crm';
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
import { useIsModalOpen } from './hooks/siteSettingsHooks';
import { closeModal } from './store/siteSettings/siteSettingsSlice';
import './styles/App.css';

function CrmApp() {
  const [search, setSearch] = useState('');
  const isModalOpen = useIsModalOpen();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const companyError = useAppSelector((state) => state.companies.error);
  const contactError = useAppSelector((state) => state.contacts.error);
  const apiErrors = [companyError, contactError].filter((error): error is string => Boolean(error));

  useEffect(() => {
    void dispatch(fetchCompanies());
    void dispatch(fetchContacts());
  }, [dispatch]);

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
      {apiErrors.length > 0 && (
        <div className="api-error" role="alert">
          {apiErrors.join(' ')}
        </div>
      )}
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
        <Popup labelledBy="record-form-title" onClose={() => dispatch(closeModal())}>
          <RecordForm />
        </Popup>
      )}
    </AppLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CrmApp />
    </BrowserRouter>
  );
}

export default App;
