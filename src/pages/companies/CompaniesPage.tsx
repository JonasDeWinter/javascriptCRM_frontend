import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import CrmTable from '../../components/ui/CrmTable';
import CrmTableRow from '../../components/ui/CrmTableRow';
import Icon from '../../components/ui/Icon';
import MetricCard from '../../components/ui/MetricCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppDispatch } from '../../hooks/reduxHooks';
import useModalContext from '../../hooks/useModalContext';
import { useCompanyData } from '../../hooks/CompanyHooks';
import { useContactData } from '../../hooks/ContactHooks';
import { setSelectedCompanyId } from '../../store/company/companySlice';
import { CompanyStatus } from '../../types/company';
import { CrmPage } from '../../types/crm';

interface CompaniesPageProps {
  search: string;
  onDeleteSelected: (ids: string[]) => void;
}

function CompaniesPage({ search, onDeleteSelected }: CompaniesPageProps) {
  const { openModal, setCurrentPage } = useModalContext();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const companies = useCompanyData();
  const contacts = useContactData();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useEffect(() => {
    setCurrentPage(CrmPage.Companies);
  }, [setCurrentPage]);
  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return companies.filter((company) => !query || [
      company.name,
      company.industry,
      company.location,
      company.status,
    ].some((value) => value.toLowerCase().includes(query)));
  }, [companies, search]);
  const customers = companies.filter((company) => company.status === CompanyStatus.Customer).length;
  const prospects = companies.filter((company) => company.status === CompanyStatus.Prospect).length;
  const companyContactCounts = useMemo(() => {
    const counts = new Map<string, number>();
    contacts.forEach((contact) => {
      if (contact.companyId) {
        counts.set(contact.companyId, (counts.get(contact.companyId) ?? 0) + 1);
      }
    });
    return counts;
  }, [contacts]);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow__dot" /> YOUR BUSINESS NETWORK</div>
          <h1>Companies <span className="heading-count">{companies.length}</span></h1>
          <p>Get a clear view of the organizations you work with.</p>
        </div>
        <button className="button button--primary" type="button" onClick={openModal}><Icon name="plus" size={18} /> Add company</button>
      </div>
      <section className="metrics-grid" aria-label="Company summary">
        <MetricCard label="Total companies" value={String(companies.length)} change="+9.4%" icon="building" />
        <MetricCard label="Customers" value={String(customers)} change="+6.8%" icon="spark" tone="green" />
        <MetricCard label="Prospects" value={String(prospects)} change="+3.2%" icon="chart" tone="amber" />
        <MetricCard label="Associated contacts" value={String(contacts.filter((contact) => contact.companyId).length)} change="+11.6%" icon="users" />
      </section>
      <CrmTable
        title="All companies"
        description="Your accounts, all in one place."
        firstColumnLabel="Company"
        selectAllLabel="Select all companies"
        columns={[
          'Industry',
          'Location',
          'Contacts',
          'Annual revenue',
          'Status',
          <span className="sr-only">Actions</span>,
        ]}
        toolbar={
          <>
            <div className="table-tabs"><button className="table-tab table-tab--active" type="button">All companies<span>{companies.length}</span></button><button className="table-tab" type="button">Recently added</button></div>
            <span className="company-helper"><Icon name="spark" size={15} /> Enriched company profiles</span>
          </>
        }
        rowCount={filteredCompanies.length}
        rowIds={filteredCompanies.map((company) => company.id)}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onDeleteSelected={onDeleteSelected}
        totalCount={companies.length}
        itemLabel="companies"
        emptyMessage="No companies match your search."
        tableClassName="company-table"
      >
        {filteredCompanies.map((company) => (
          <CrmTableRow
            key={company.id}
            id={company.id}
            name={company.name}
            description={`${company.employees} employees`}
            selected={selectedIds.includes(company.id)}
            onNameClick={() => {
              dispatch(setSelectedCompanyId(company.id));
              navigate(`/companies/${company.id}`);
            }}
            onSelectionChange={(id, selected) => setSelectedIds((current) => (
              selected
                ? Array.from(new Set([...current, id]))
                : current.filter((selectedId) => selectedId !== id)
            ))}
            cells={[
              { content: company.industry },
              { content: company.location },
              {
                content: <span className="company-contact-count"><Avatar name={`${company.name} team`} size="small" />{companyContactCounts.get(company.id) ?? 0}</span>,
              },
              { content: company.annualRevenue, className: 'revenue-cell' },
              { content: <StatusBadge status={company.status} /> },
            ]}
          />
        ))}
      </CrmTable>
      <div className="page-footer"><span>© 2024 Orbit CRM</span><span>Need help? <a href="mailto:support@orbitcrm.example">Contact support</a></span></div>
    </>
  );
}

export default CompaniesPage;

