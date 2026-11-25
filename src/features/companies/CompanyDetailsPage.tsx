import React, { useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Icon from '../../components/ui/Icon';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { useCompanyData } from '../../hooks/CompanyHooks';
import { useContactData } from '../../hooks/ContactHooks';
import useModalContext from '../../hooks/useModalContext';
import { setSelectedContactId } from '../../store/contact/contactSlice';
import { setSelectedCompanyId } from '../../store/company/companySlice';
import { CrmPage } from '../../types/crm';

function CompanyDetailsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { setCurrentPage } = useModalContext();
  const contacts = useContactData();
  const companies = useCompanyData();
  const selectedCompanyId = useAppSelector((state) => state.companies.selectedCompanyId);

  const company = companies.find((item) => item.id === selectedCompanyId);
  const associatedContacts = contacts.filter((contact) => contact.companyId === selectedCompanyId);

  useEffect(() => {
    setCurrentPage(CrmPage.Companies);
  }, [setCurrentPage]);

  useLayoutEffect(() => {
    dispatch(setSelectedCompanyId(companyId ?? null));
  }, [companyId, dispatch]);

  if (!company) {
    return (
      <section className="contact-not-found">
        <h1>Company not found</h1>
        <p>This company may have been removed.</p>
        <button className="button button--secondary" type="button" onClick={() => navigate('/companies')}>
          <Icon name="chevron" size={16} /> Back to companies
        </button>
      </section>
    );
  }

  return (
    <div className="contact-details company-details">
      <button className="detail-back-button" type="button" onClick={() => navigate('/companies')}>
        <Icon name="chevron" size={16} /> Companies
      </button>
      <section className="contact-profile-heading">
        <div className="contact-profile-heading__identity">
          <span className={`company-mark company-profile-mark company-mark--${company.name.split(' ')[0].toLowerCase()}`}>
            {company.name.charAt(0)}
          </span>
          <div>
            <div className="eyebrow"><span className="eyebrow__dot" /> COMPANY PROFILE</div>
            <h1>{company.name}</h1>
            <p>{company.industry}</p>
          </div>
        </div>
        <StatusBadge status={company.status} />
      </section>

      <div className="contact-details-grid company-details-grid">
        <section className="contact-detail-card">
          <h2>Company information</h2>
          <div className="contact-detail-field">
            <span>Company name</span>
            <strong>{company.name}</strong>
          </div>
          <div className="contact-detail-field">
            <span>Industry</span>
            <strong>{company.industry}</strong>
          </div>
          <div className="contact-detail-field">
            <span>Company size</span>
            <strong>{company.employees} employees</strong>
          </div>
          <div className="contact-detail-field">
            <span>Location</span>
            <strong>{company.location}</strong>
          </div>
          <div className="contact-detail-field">
            <span>Annual revenue</span>
            <strong>{company.annualRevenue}</strong>
          </div>
          <div className="contact-detail-field">
            <span>Status</span>
            <strong><StatusBadge status={company.status} /></strong>
          </div>
        </section>

        <section className="contact-detail-card company-contacts-card">
          <h2>Associated contacts <span>{associatedContacts.length}</span></h2>
          {associatedContacts.length ? (
            <ul className="company-contacts-list">
              {associatedContacts.map((contact) => (
                <li key={contact.id}>
                  <button
                    className="company-contact-link"
                    onClick={() => {
                      dispatch(setSelectedContactId(contact.id));
                      navigate(`/contacts/${contact.id}`);
                    }}
                    type="button"
                    aria-label={`View details for ${contact.name}`}
                  >
                    <Avatar name={contact.name} size="medium" />
                    <span className="company-contact-copy">
                      <strong>{contact.name}</strong>
                      <small>{contact.title}</small>
                      <small>{contact.email}</small>
                    </span>
                    <StatusBadge status={contact.status} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-company-message">No contacts are associated with this company.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default CompanyDetailsPage;
