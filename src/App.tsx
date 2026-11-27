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
import LoginPage from './pages/LoginPage';
import { clearStoredAuth, UNAUTHORIZED_EVENT } from './services/apiClient';
import { logout } from './store/auth/authSlice';
import './styles/App.css';

interface LoginRedirectState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

function CrmApp() {
  const [search, setSearch] = useState('');
  const isModalOpen = useIsModalOpen();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const companyError = useAppSelector((state) => state.companies.error);
  const contactError = useAppSelector((state) => state.contacts.error);
  const token = useAppSelector((state) => state.auth.token);
  const username = useAppSelector((state) => state.auth.username);
  const expiresAt = useAppSelector((state) => state.auth.expiresAt);
  const apiErrors = [companyError, contactError].filter((error): error is string => Boolean(error));
  const redirectState = location.state as LoginRedirectState | null;
  const requestedPath = redirectState?.from;
  const loginReturnPath = requestedPath && requestedPath.pathname !== '/' && requestedPath.pathname !== '/login'
    ? `${requestedPath.pathname ?? ''}${requestedPath.search ?? ''}${requestedPath.hash ?? ''}`
    : `/${CrmPage.Contacts}`;

  useEffect(() => {
    if (!token || expiresAt === null || expiresAt <= Date.now()) return;
    void dispatch(fetchCompanies());
    void dispatch(fetchContacts());
  }, [dispatch, expiresAt, token]);

  useEffect(() => {
    if (!token || expiresAt === null) return;

    const remainingTime = expiresAt - Date.now();
    if (remainingTime <= 0) {
      clearStoredAuth();
      dispatch(logout());
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearStoredAuth();
      dispatch(logout());
    }, remainingTime);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, expiresAt, token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredAuth();
      dispatch(logout());
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [dispatch]);

  if (!token || expiresAt === null || expiresAt <= Date.now()) {
    if (location.pathname !== '/login') {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
      <LoginPage
        onLoginSuccess={() => navigate(loginReturnPath, { replace: true })}
      />
    );
  }

  if (location.pathname === '/login') {
    return <Navigate to={`/${CrmPage.Contacts}`} replace />;
  }

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
      username={username ?? ''}
      onLogout={() => {
        clearStoredAuth();
        dispatch(logout());
        dispatch(closeModal());
      }}
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
