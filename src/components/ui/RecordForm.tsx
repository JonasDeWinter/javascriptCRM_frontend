import React, { FormEvent, useState } from 'react';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useCompanyData } from '../../hooks/CompanyHooks';
import { useCurrentPage } from '../../hooks/siteSettingsHooks';
import { createCompany } from '../../store/company/companySlice';
import { createContact } from '../../store/contact/contactSlice';
import { closeModal } from '../../store/siteSettings/siteSettingsSlice';
import { CrmPage } from '../../types/crm';
import Icon from './Icon';

function RecordForm() {
  const dispatch = useAppDispatch();
  const currentPage = useCurrentPage();
  const closePopup = () => dispatch(closeModal());
  const companies = useCompanyData();
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const isContact = currentPage === CrmPage.Contacts;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentPage === CrmPage.Contacts) {
      void dispatch(createContact({
        firstName,
        lastName,
        email,
        phone,
        companyId: companyId || null,
      })).then((result) => {
        if (createContact.fulfilled.match(result)) closePopup();
      });
    } else {
      void dispatch(createCompany({
        name,
        industry,
        website,
        phone,
        address,
      })).then((result) => {
        if (createCompany.fulfilled.match(result)) closePopup();
      });
    }
  };

  return (
    <div className="record-form">
      <div className="record-form__top">
        <span className="record-form__icon"><Icon name={isContact ? 'users' : 'building'} size={21} /></span>
        <button className="icon-button" type="button" aria-label="Close dialog" onClick={closePopup}><Icon name="close" size={19} /></button>
      </div>
      <h2 id="record-form-title">Add {isContact ? 'a contact' : 'a company'}</h2>
      <p className="record-form__description">Add a new {isContact ? 'person to your contacts' : 'company to your workspace'}.</p>
      <form onSubmit={handleSubmit}>
        {isContact ? (
          <>
            <label className="form-field"><span>First name</span><input autoFocus required value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="e.g. Jamie" /></label>
            <label className="form-field"><span>Last name</span><input required value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="e.g. Lee" /></label>
            <label className="form-field"><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" /></label>
            <label className="form-field"><span>Phone number</span><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Optional" /></label>
            <label className="form-field">
              <span>Company</span>
              <select value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
                <option value="">No company</option>
                {companies.map((companyOption) => (
                  <option key={companyOption.id} value={companyOption.id}>{companyOption.name}</option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <label className="form-field"><span>Company name</span><input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Acme Inc." /></label>
            <label className="form-field"><span>Industry</span><input value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="e.g. Software" /></label>
            <label className="form-field"><span>Website</span><input type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" /></label>
            <label className="form-field"><span>Phone number</span><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Optional" /></label>
            <label className="form-field"><span>Address</span><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street, city, country" /></label>
          </>
        )}
        <div className="record-form__footer">
          <button className="button button--secondary" type="button" onClick={closePopup}>Cancel</button>
          <button className="button button--primary" type="submit"><Icon name="plus" size={17} /> Add {isContact ? 'contact' : 'company'}</button>
        </div>
      </form>
    </div>
  );
}

export default RecordForm;
