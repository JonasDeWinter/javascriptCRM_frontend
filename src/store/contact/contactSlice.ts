import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Contact } from '../../types/contact';
import { initialContacts } from '../../utils/seedData';
import { deleteCompanies } from '../company/companySlice';

export interface ContactUpdate {
  id: string;
  changes: Partial<Omit<Contact, 'id'>>;
}

const contactSlice = createSlice({
  name: 'contacts',
  initialState: initialContacts,
  reducers: {
    addContact(state, action: PayloadAction<Contact>) {
      state.unshift(action.payload);
    },
    deleteContacts(state, action: PayloadAction<string[]>) {
      const deletedIds = new Set(action.payload);
      return state.filter((contact) => !deletedIds.has(contact.id));
    },
    updateContact(state, action: PayloadAction<ContactUpdate>) {
      const contact = state.find((item) => item.id === action.payload.id);
      if (contact) {
        Object.assign(contact, action.payload.changes);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteCompanies, (state, action) => {
      const deletedCompanyIds = new Set(action.payload);
      state.forEach((contact) => {
        if (contact.companyId && deletedCompanyIds.has(contact.companyId)) {
          contact.companyId = null;
        }
      });
    });
  },
});

export const { addContact, deleteContacts, updateContact } = contactSlice.actions;
export default contactSlice.reducer;
