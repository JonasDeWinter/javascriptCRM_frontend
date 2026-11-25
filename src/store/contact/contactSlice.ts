import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Contact } from '../../types/contact';
import { initialContacts } from '../../utils/seedData';
import { deleteCompanies } from '../company/companySlice';

export interface ContactUpdate {
  changes: Partial<Omit<Contact, 'id'>>;
}

export interface ContactState {
  contacts: Contact[];
  selectedContactId: string | null;
}

const initialState: ContactState = {
  contacts: initialContacts,
  selectedContactId: null,
};

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    addContact(state, action: PayloadAction<Contact>) {
      state.contacts.unshift(action.payload);
    },
    setSelectedContactId(state, action: PayloadAction<string | null>) {
      state.selectedContactId = action.payload;
    },
    deleteContacts(state, action: PayloadAction<string[]>) {
      const deletedIds = new Set(action.payload);
      state.contacts = state.contacts.filter((contact) => !deletedIds.has(contact.id));
      if (state.selectedContactId && deletedIds.has(state.selectedContactId)) {
        state.selectedContactId = null;
      }
    },
    updateContact(state, action: PayloadAction<ContactUpdate>) {
      const contact = state.contacts.find((item) => item.id === state.selectedContactId);
      if (contact) {
        Object.assign(contact, action.payload.changes);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteCompanies, (state, action) => {
      const deletedCompanyIds = new Set(action.payload);
      state.contacts.forEach((contact) => {
        if (contact.companyId && deletedCompanyIds.has(contact.companyId)) {
          contact.companyId = null;
        }
      });
    });
  },
});

export const { addContact, deleteContacts, setSelectedContactId, updateContact } = contactSlice.actions;
export default contactSlice.reducer;
