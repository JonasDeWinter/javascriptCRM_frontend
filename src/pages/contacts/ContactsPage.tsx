import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CrmTable from '../../components/ui/CrmTable';
import CrmTableRow from '../../components/ui/CrmTableRow';
import Icon from '../../components/ui/Icon';
import MetricCard from '../../components/ui/MetricCard';
import { useCompanyData } from '../../hooks/CompanyHooks';
import { useContactData } from '../../hooks/ContactHooks';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { setCurrentPage, openModal } from '../../store/siteSettings/siteSettingsSlice';
import { setSelectedContactId } from '../../store/contact/contactSlice';
import { CrmPage } from '../../types/crm';
import { formatContactName } from '../../utils/formatContactName';

interface ContactsPageProps {
  search: string;
  onDeleteSelected: (ids: string[]) => void;
}

function ContactsPage({ search, onDeleteSelected }: ContactsPageProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const contacts = useContactData();
  const companies = useCompanyData();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const companyById = useMemo(
    () => new Map(companies.map((company) => [company.id, company])),
    [companies]
  );
  useEffect(() => {
    dispatch(setCurrentPage(CrmPage.Contacts));
  }, [dispatch]);
  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesSearch = !query || [
        formatContactName(contact),
        contact.email,
        companyById.get(contact.companyId ?? '')?.name ?? '',
        contact.firstName,
        contact.lastName,
        contact.phone,
      ].some((value) => value.toLowerCase().includes(query));
      return matchesSearch;
    });
  }, [companyById, contacts, search]);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow__dot" /> CUSTOMER RELATIONSHIPS</div>
          <h1>Contacts <span className="heading-count">{contacts.length}</span></h1>
          <p>Keep track of the people who make your business move.</p>
        </div>
        <button className="button button--primary" type="button" onClick={() => dispatch(openModal())}><Icon name="plus" size={18} /> Add contact</button>
      </div>
      <section className="metrics-grid" aria-label="Contact summary">
        <MetricCard label="Total contacts" value={String(contacts.length)} change="+12.8%" icon="users" />
        <MetricCard label="With company" value={String(contacts.filter((contact) => contact.companyId).length)} change="+8.2%" icon="spark" tone="green" />
        <MetricCard label="With email" value={String(contacts.filter((contact) => contact.email).length)} change="+4.3%" icon="chart" tone="amber" />
        <MetricCard label="With phone" value={String(contacts.filter((contact) => contact.phone).length)} change="+2.1%" icon="building" />
      </section>
      <CrmTable
        title="All contacts"
        description="A shared view of everyone in your network."
        firstColumnLabel="Name"
        selectAllLabel="Select all contacts"
        columns={[
          'Company',
          'Phone',
        ]}
        toolbar={
          <>
            <div className="table-tabs"><button className="table-tab table-tab--active" type="button">All contacts<span>{contacts.length}</span></button></div>
            <button className="toolbar-search" type="button"><Icon name="search" size={16} /><span>Search contacts</span></button>
          </>
        }
        rowCount={filteredContacts.length}
        rowIds={filteredContacts.map((contact) => contact.id)}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onDeleteSelected={onDeleteSelected}
        totalCount={contacts.length}
        itemLabel="contacts"
        emptyMessage="No contacts match your search."
      >
        {filteredContacts.map((contact) => {
          const company = contact.companyId ? companyById.get(contact.companyId) : undefined;
          return (
            <CrmTableRow
              key={contact.id}
              id={contact.id}
              name={formatContactName(contact)}
              description={contact.email}
              selected={selectedIds.includes(contact.id)}
              onSelectionChange={(id, selected) => setSelectedIds((current) => (
                selected
                  ? Array.from(new Set([...current, id]))
                  : current.filter((selectedId) => selectedId !== id)
              ))}
              onNameClick={() => {
                dispatch(setSelectedContactId(contact.id));
                navigate(`/contacts/${contact.id}`);
              }}
              cells={[
                {
                  content: company ? (
                    <span className="company-cell"><span className={`company-mark company-mark--${company.name.split(' ')[0].toLowerCase()}`}>{company.name.charAt(0)}</span><span><strong>{company.name}</strong></span></span>
                  ) : <span className="company-empty">No company</span>,
                },
                { content: contact.phone || '—' },
              ]}
            />
          );
        })}
      </CrmTable>
      <div className="page-footer"><span>© 2024 Orbit CRM</span><span>Need help? <a href="mailto:support@orbitcrm.example">Contact support</a></span></div>
        
    </>
  );
}

export default ContactsPage;
