import React, { useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Icon from '../../components/ui/Icon';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useCompanyData, useSelectedCompanyId } from '../../hooks/CompanyHooks';
import { useContactData } from '../../hooks/ContactHooks';
import { setCurrentPage } from '../../store/siteSettings/siteSettingsSlice';
import { setSelectedContactId } from '../../store/contact/contactSlice';
import { setSelectedCompanyId } from '../../store/company/companySlice';
import { CrmPage } from '../../types/crm';
import { formatContactName } from '../../utils/formatContactName';

function CompanyDetailsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const contacts = useContactData();
  const companies = useCompanyData();
  const selectedCompanyId = useSelectedCompanyId();

  const company = companies.find((item) => item.id === selectedCompanyId);
  const associatedContacts = contacts.filter((contact) => contact.companyId === selectedCompanyId);

  useEffect(() => {
    dispatch(setCurrentPage(CrmPage.Companies));
  }, [dispatch]);

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
            <span>Address</span>
            <strong>{company.address || '—'}</strong>
          </div>
          <div className="contact-detail-field">
            <span>Phone</span>
            <strong>{company.phone || '—'}</strong>
          </div>
          <div className="contact-detail-field">
            <span>Website</span>
            <strong>{company.website || '—'}</strong>
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
                    aria-label={`View details for ${formatContactName(contact)}`}
                  >
                    <Avatar name={formatContactName(contact)} size="medium" />
                    <span className="company-contact-copy">
                      <strong>{formatContactName(contact)}</strong>
                      <small>{contact.email}</small>
                    </span>
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
