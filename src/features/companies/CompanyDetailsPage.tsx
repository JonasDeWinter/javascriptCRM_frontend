import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Icon from '../../components/ui/Icon';
import StatusBadge from '../../components/ui/StatusBadge';
import useModalContext from '../../hooks/useModalContext';
import { Company, Contact, CrmPage } from '../../types/crm';

interface CompanyDetailsPageProps {
  companies: Company[];
  contacts: Contact[];
}

function CompanyDetailsPage({ companies, contacts }: CompanyDetailsPageProps) {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { setCurrentPage } = useModalContext();
  const company = companies.find((item) => item.id === companyId);
  const associatedContacts = contacts.filter((contact) => contact.companyId === companyId);

  useEffect(() => {
    setCurrentPage(CrmPage.Companies);
  }, [setCurrentPage]);

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
                    onClick={() => navigate(`/contacts/${contact.id}`)}
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
