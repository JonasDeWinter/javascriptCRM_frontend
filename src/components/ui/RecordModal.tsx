import React, { FormEvent, useState } from 'react';
import useModalContext from '../../hooks/useModalContext';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { addCompany } from '../../store/company/companySlice';
import { addContact } from '../../store/contact/contactSlice';
import { Company } from '../../types/crm';
import Icon from './Icon';

interface RecordModalProps {
  companies: Company[];
}

function RecordModal({ companies }: RecordModalProps) {
  const { currentPage, closeModal } = useModalContext();
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [employees, setEmployees] = useState('');
  const [location, setLocation] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const isContact = currentPage === 'contacts';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentPage === 'contacts') {
      dispatch(addContact({
        id: `contact-${Date.now()}`,
        name,
        email,
        companyId: companyId || null,
        title,
        status: 'Lead',
        owner: 'You',
        lastContacted: 'Just now',
      }));
    } else {
      dispatch(addCompany({
        id: `company-${Date.now()}`,
        name,
        industry,
        employees: employees || '—',
        location: location || '—',
        annualRevenue: annualRevenue || '—',
        status: 'Prospect',
      }));
    }
    closeModal();
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <section className="record-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="record-modal__top">
          <span className="record-modal__icon"><Icon name={isContact ? 'users' : 'building'} size={21} /></span>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={closeModal}><Icon name="close" size={19} /></button>
        </div>
        <h2 id="modal-title">Add {isContact ? 'a contact' : 'a company'}</h2>
        <p className="record-modal__description">Add a new {isContact ? 'person to your contacts' : 'company to your workspace'}.</p>
        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>{isContact ? 'Full name' : 'Company name'}</span>
            <input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder={isContact ? 'e.g. Jamie Lee' : 'e.g. Acme Inc.'} />
          </label>
          {isContact ? (
            <>
              <label className="form-field"><span>Email address</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" /></label>
              <label className="form-field">
                <span>Company</span>
                <select value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
                  <option value="">No company</option>
                  {companies.map((companyOption) => (
                    <option key={companyOption.id} value={companyOption.id}>{companyOption.name}</option>
                  ))}
                </select>
              </label>
              <label className="form-field"><span>Job title</span><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Product Manager" /></label>
            </>
          ) : (
            <>
              <label className="form-field"><span>Industry</span><input required value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="e.g. Software" /></label>
              <div className="form-field-row">
                <label className="form-field"><span>Employees</span><input value={employees} onChange={(event) => setEmployees(event.target.value)} placeholder="e.g. 11–50" /></label>
                <label className="form-field"><span>Annual revenue</span><input value={annualRevenue} onChange={(event) => setAnnualRevenue(event.target.value)} placeholder="e.g. $2.4M" /></label>
              </div>
              <label className="form-field"><span>Location</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, country" /></label>
            </>
          )}
          <div className="record-modal__footer">
            <button className="button button--secondary" type="button" onClick={closeModal}>Cancel</button>
            <button className="button button--primary" type="submit"><Icon name="plus" size={17} /> Add {isContact ? 'contact' : 'company'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RecordModal;
