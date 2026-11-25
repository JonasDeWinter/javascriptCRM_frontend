import { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import CrmTable from '../../components/ui/CrmTable';
import CrmTableRow from '../../components/ui/CrmTableRow';
import Icon from '../../components/ui/Icon';
import MetricCard from '../../components/ui/MetricCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useCompanyData } from '../../hooks/CompanyHooks';
import { useContactData } from '../../hooks/ContactHooks';
import { useAppDispatch } from '../../hooks/reduxHooks';
import useModalContext from '../../hooks/useModalContext';
import { setSelectedContactId } from '../../store/contact/contactSlice';
import { ContactStatus } from '../../types/contact';
import { CrmPage } from '../../types/crm';

interface ContactsPageProps {
  search: string;
  onDeleteSelected: (ids: string[]) => void;
}

function ContactsPage({ search, onDeleteSelected }: ContactsPageProps) {
  const { openModal, setCurrentPage } = useModalContext();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const contacts = useContactData();
  const companies = useCompanyData();
  const [statusFilter, setStatusFilter] = useState('All contacts');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const companyById = useMemo(
    () => new Map(companies.map((company) => [company.id, company])),
    [companies]
  );
  useEffect(() => {
    setCurrentPage(CrmPage.Contacts);
  }, [setCurrentPage]);
  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesSearch = !query || [
        contact.name,
        contact.email,
        companyById.get(contact.companyId ?? '')?.name ?? '',
        contact.title,
        contact.owner,
      ].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = statusFilter === 'All contacts' || contact.status === statusFilter.slice(0, -1);
      return matchesSearch && matchesStatus;
    });
  }, [companyById, contacts, search, statusFilter]);
  const customers = contacts.filter((contact) => contact.status === ContactStatus.Customer).length;
  const leads = contacts.filter((contact) => contact.status === ContactStatus.Lead).length;
  const prospects = contacts.filter((contact) => contact.status === ContactStatus.Prospect).length;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow__dot" /> CUSTOMER RELATIONSHIPS</div>
          <h1>Contacts <span className="heading-count">{contacts.length}</span></h1>
          <p>Keep track of the people who make your business move.</p>
        </div>
        <button className="button button--primary" type="button" onClick={openModal}><Icon name="plus" size={18} /> Add contact</button>
      </div>
      <section className="metrics-grid" aria-label="Contact summary">
        <MetricCard label="Total contacts" value={String(contacts.length)} change="+12.8%" icon="users" />
        <MetricCard label="Customers" value={String(customers)} change="+8.2%" icon="spark" tone="green" />
        <MetricCard label="Open leads" value={String(leads)} change="+4.3%" icon="chart" tone="amber" />
        <MetricCard label="Prospects" value={String(prospects)} change="+2.1%" icon="building" />
      </section>
      <CrmTable
        title="All contacts"
        description="A shared view of everyone in your network."
        firstColumnLabel="Name"
        selectAllLabel="Select all contacts"
        columns={[
          'Company',
          'Status',
          'Owner',
          'Last contacted',
          <span className="sr-only">Actions</span>,
        ]}
        toolbar={
          <>
            <div className="table-tabs">
              {['All contacts', 'Customers', 'Leads', 'Prospects'].map((filter) => (
                <button
                  className={`table-tab ${statusFilter === filter ? 'table-tab--active' : ''}`}
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  type="button"
                >
                  {filter}
                  <span>{filter === 'All contacts' ? contacts.length : contacts.filter((contact) => contact.status === filter.slice(0, -1)).length}</span>
                </button>
              ))}
            </div>
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
              name={contact.name}
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
                    <span className="company-cell"><span className={`company-mark company-mark--${company.name.split(' ')[0].toLowerCase()}`}>{company.name.charAt(0)}</span><span><strong>{company.name}</strong><small>{contact.title}</small></span></span>
                  ) : <span className="company-empty">No company</span>,
                },
                { content: <StatusBadge status={contact.status} /> },
                { content: <span className="owner-cell"><Avatar name={contact.owner} size="small" />{contact.owner}</span> },
                { content: contact.lastContacted, className: 'last-contacted' },
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
