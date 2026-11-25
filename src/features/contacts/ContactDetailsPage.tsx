import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Icon from '../../components/ui/Icon';
import useModalContext from '../../hooks/useModalContext';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { updateContact } from '../../store/contact/contactSlice';
import { Company, Contact, ContactStatus, CrmPage } from '../../types/crm';

type EditableContact = Pick<Contact, 'name' | 'email' | 'companyId' | 'title' | 'status' | 'owner' | 'lastContacted'>;

function createContactDraft(contact?: Contact): EditableContact {
  return {
    name: contact?.name ?? '',
    email: contact?.email ?? '',
    companyId: contact?.companyId ?? null,
    title: contact?.title ?? '',
    status: contact?.status ?? ContactStatus.Lead,
    owner: contact?.owner ?? '',
    lastContacted: contact?.lastContacted ?? '',
  };
}

interface ContactDetailsPageProps {
  contacts: Contact[];
  companies: Company[];
}

function ContactDetailsPage({ contacts, companies }: ContactDetailsPageProps) {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const { setCurrentPage } = useModalContext();
  const dispatch = useAppDispatch();
  const contact = contacts.find((item) => item.id === contactId);
  const [draft, setDraft] = useState<EditableContact>(() => createContactDraft(contact));
  const company = draft.companyId
    ? companies.find((item) => item.id === draft.companyId)
    : undefined;

  useEffect(() => {
    setCurrentPage(CrmPage.Contacts);
  }, [setCurrentPage]);

  useEffect(() => {
    if (contact) {
      setDraft(createContactDraft(contact));
    }
  }, [contact]);

  if (!contact) {
    return (
      <section className="contact-not-found">
        <h1>Contact not found</h1>
        <p>This contact may have been removed.</p>
        <button className="button button--secondary" type="button" onClick={() => navigate('/contacts')}>
          <Icon name="chevron" size={16} /> Back to contacts
        </button>
      </section>
    );
  }

  const hasChanges = (
    draft.name !== contact.name
    || draft.email !== contact.email
    || draft.companyId !== contact.companyId
    || draft.title !== contact.title
    || draft.status !== contact.status
    || draft.owner !== contact.owner
    || draft.lastContacted !== contact.lastContacted
  );
  const associatedContacts = company
    ? contacts.filter((item) => item.id !== contact.id && item.companyId === company.id).length + 1
    : 0;
  const updateDraft = (changes: Partial<EditableContact>) => {
    setDraft((current) => ({ ...current, ...changes }));
  };
  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(updateContact({ id: contact.id, changes: draft }));
  };

  return (
    <form className="contact-details" onSubmit={handleSave}>
      <button className="detail-back-button" type="button" onClick={() => navigate('/contacts')}>
        <Icon name="chevron" size={16} /> Contacts
      </button>
      <section className="contact-profile-heading">
        <div className="contact-profile-heading__identity">
          <Avatar name={draft.name} size="large" />
          <div>
            <div className="eyebrow"><span className="eyebrow__dot" /> CONTACT PROFILE</div>
            <h1>{draft.name}</h1>
            <p>{draft.title}</p>
          </div>
        </div>
        <div className="contact-profile-heading__actions">
          <label className="sr-only" htmlFor="contact-status">Contact status</label>
          <select
            className={`contact-status-select status-badge--${draft.status.toLowerCase()}`}
            id="contact-status"
            value={draft.status}
            onChange={(event) => {
              const status = event.target.value;
              if (
                status === ContactStatus.Customer
                || status === ContactStatus.Lead
                || status === ContactStatus.Prospect
              ) {
                updateDraft({ status });
              }
            }}
          >
            <option value={ContactStatus.Customer}>{ContactStatus.Customer}</option>
            <option value={ContactStatus.Lead}>{ContactStatus.Lead}</option>
            <option value={ContactStatus.Prospect}>{ContactStatus.Prospect}</option>
          </select>
          {hasChanges && (
            <button className="button button--primary" type="submit">
              <Icon name="check" size={16} /> Save changes
            </button>
          )}
        </div>
      </section>

      <div className="contact-details-grid">
        <section className="contact-detail-card">
          <h2>Contact information</h2>
          <label className="contact-detail-field">
            <span>Full name</span>
            <input aria-label="Full name" required value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} />
          </label>
          <label className="contact-detail-field">
            <span>Email address</span>
            <span className="contact-detail-control"><Icon name="mail" size={16} />
              <input aria-label="Email address" required type="email" value={draft.email} onChange={(event) => updateDraft({ email: event.target.value })} />
            </span>
          </label>
          <label className="contact-detail-field">
            <span>Job title</span>
            <input aria-label="Job title" required value={draft.title} onChange={(event) => updateDraft({ title: event.target.value })} />
          </label>
          <label className="contact-detail-field">
            <span>Contact owner</span>
            <span className="contact-detail-control"><Avatar name={draft.owner || 'Owner'} size="small" />
              <input aria-label="Contact owner" required value={draft.owner} onChange={(event) => updateDraft({ owner: event.target.value })} />
            </span>
          </label>
          <label className="contact-detail-field">
            <span>Last contacted</span>
            <input aria-label="Last contacted" value={draft.lastContacted} onChange={(event) => updateDraft({ lastContacted: event.target.value })} />
          </label>
        </section>

        <section className="contact-detail-card company-association-card">
          <h2>Company association</h2>
          <label className="contact-detail-field">
            <span>Company</span>
            <select aria-label="Company" value={draft.companyId ?? ''} onChange={(event) => updateDraft({ companyId: event.target.value || null })}>
              <option value="">No company</option>
              {companies.map((companyOption) => (
                <option key={companyOption.id} value={companyOption.id}>{companyOption.name}</option>
              ))}
            </select>
          </label>
          {company ? (
            <>
              <button
                className="associated-company associated-company-link"
                onClick={() => navigate(`/companies/${company.id}`)}
                type="button"
                aria-label={`View details for ${company.name}`}
              >
                <span className={`company-mark company-mark--${company.name.split(' ')[0].toLowerCase()}`}>
                  {company.name.charAt(0)}
                </span>
                <div>
                  <strong>{company.name}</strong>
                  <span>{company.industry}</span>
                </div>
              </button>
              <div className="contact-detail-field">
                <span>Location</span>
                <strong>{company.location}</strong>
              </div>
              <div className="contact-detail-field">
                <span>Company size</span>
                <strong>{company.employees} employees</strong>
              </div>
              <div className="contact-detail-field">
                <span>Associated contacts</span>
                <strong>{associatedContacts}</strong>
              </div>
            </>
          ) : (
            <p className="no-company-message">This contact isn't associated with a company.</p>
          )}
        </section>
      </div>
    </form>
  );
}

export default ContactDetailsPage;
