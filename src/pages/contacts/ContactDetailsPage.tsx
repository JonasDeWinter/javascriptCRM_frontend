import { FormEvent, useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Icon from '../../components/ui/Icon';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useCompanyData } from '../../hooks/CompanyHooks';
import { useContactData } from '../../hooks/ContactHooks';
import { setCurrentPage } from '../../store/siteSettings/siteSettingsSlice';
import { setSelectedContactId, updateContact } from '../../store/contact/contactSlice';
import { Contact } from '../../types/contact';
import { CrmPage } from '../../types/crm';
import { formatContactName } from '../../utils/formatContactName';

type EditableContact = Pick<Contact, 'firstName' | 'lastName' | 'email' | 'phone' | 'companyId'>;

function createContactDraft(contact?: Contact): EditableContact {
  return {
    firstName: contact?.firstName ?? '',
    lastName: contact?.lastName ?? '',
    email: contact?.email ?? '',
    phone: contact?.phone ?? '',
    companyId: contact?.companyId ?? null,
  };
}

function ContactDetailsPage() {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const contacts = useContactData();
  const companies = useCompanyData();
  const contact = contacts.find((item) => item.id === contactId);
  const [draft, setDraft] = useState<EditableContact>(() => createContactDraft(contact));
  const company = draft.companyId
    ? companies.find((item) => item.id === draft.companyId)
    : undefined;

  useEffect(() => {
    dispatch(setCurrentPage(CrmPage.Contacts));
  }, [dispatch]);

  useLayoutEffect(() => {
    dispatch(setSelectedContactId(contactId ?? null));
  }, [contactId, dispatch]);

  useEffect(() => {
    if (contact) setDraft(createContactDraft(contact));
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
    draft.firstName !== contact.firstName
    || draft.lastName !== contact.lastName
    || draft.email !== contact.email
    || draft.phone !== contact.phone
    || draft.companyId !== contact.companyId
  );
  const associatedContacts = company
    ? contacts.filter((item) => item.id !== contact.id && item.companyId === company.id).length + 1
    : 0;
  const updateDraft = (changes: Partial<EditableContact>) => {
    setDraft((current) => ({ ...current, ...changes }));
  };
  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const changes: Partial<EditableContact> = {
      ...(draft.firstName !== contact.firstName ? { firstName: draft.firstName } : {}),
      ...(draft.lastName !== contact.lastName ? { lastName: draft.lastName } : {}),
      ...(draft.email !== contact.email ? { email: draft.email } : {}),
      ...(draft.phone !== contact.phone ? { phone: draft.phone } : {}),
      ...(draft.companyId !== contact.companyId ? { companyId: draft.companyId } : {}),
    };
    void dispatch(updateContact({ id: contact.id, changes }));
  };

  return (
    <form className="contact-details" onSubmit={handleSave}>
      <button className="detail-back-button" type="button" onClick={() => navigate('/contacts')}>
        <Icon name="chevron" size={16} /> Contacts
      </button>
      <section className="contact-profile-heading">
        <div className="contact-profile-heading__identity">
          <Avatar name={formatContactName(draft)} size="large" />
          <div>
            <div className="eyebrow"><span className="eyebrow__dot" /> CONTACT PROFILE</div>
            <h1>{formatContactName(draft)}</h1>
          </div>
        </div>
        <div className="contact-profile-heading__actions">
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
            <span>First name</span>
            <input aria-label="First name" required value={draft.firstName} onChange={(event) => updateDraft({ firstName: event.target.value })} />
          </label>
          <label className="contact-detail-field">
            <span>Last name</span>
            <input aria-label="Last name" required value={draft.lastName} onChange={(event) => updateDraft({ lastName: event.target.value })} />
          </label>
          <label className="contact-detail-field">
            <span>Email address</span>
            <span className="contact-detail-control"><Icon name="mail" size={16} />
              <input aria-label="Email address" type="email" value={draft.email} onChange={(event) => updateDraft({ email: event.target.value })} />
            </span>
          </label>
          <label className="contact-detail-field">
            <span>Phone number</span>
            <input aria-label="Phone number" value={draft.phone} onChange={(event) => updateDraft({ phone: event.target.value })} />
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
                <span>Address</span>
                <strong>{company.address || '—'}</strong>
              </div>
              <div className="contact-detail-field">
                <span>Company phone</span>
                <strong>{company.phone || '—'}</strong>
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
