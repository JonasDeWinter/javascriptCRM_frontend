import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Contact } from '../../types/contact';
import { ContactInput, crmApi } from '../../services/crmApi';
import { logout } from '../auth/authSlice';
import { deleteCompanies } from '../company/companySlice';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface ContactState {
  contacts: Contact[];
  selectedContactId: string | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: ContactState = {
  contacts: [],
  selectedContactId: null,
  status: 'idle',
  error: null,
};

export const fetchContacts = createAsyncThunk('contacts/fetchAll', crmApi.getContacts);
export const createContact = createAsyncThunk(
  'contacts/create',
  (input: ContactInput) => crmApi.createContact(input)
);
export const updateContact = createAsyncThunk(
  'contacts/update',
  ({ id, changes }: { id: string; changes: Partial<ContactInput> }) => crmApi.updateContact(id, changes)
);
export const deleteContacts = createAsyncThunk(
  'contacts/deleteMany',
  async (ids: string[]) => {
    const results = await Promise.allSettled(ids.map(async (id) => {
      await crmApi.deleteContact(id);
      return id;
    }));
    return {
      deletedIds: results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []),
      errors: results.flatMap((result) => (
        result.status === 'rejected'
          ? [result.reason instanceof Error ? result.reason.message : 'Could not delete contact']
          : []
      )),
    };
  }
);

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setSelectedContactId(state, action: PayloadAction<string | null>) {
      state.selectedContactId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.contacts = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Could not load contacts';
      })
      .addCase(createContact.pending, (state) => {
        state.error = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.contacts.unshift(action.payload);
      })
      .addCase(createContact.rejected, (state, action) => {
        state.error = action.error.message ?? 'Could not create contact';
      })
      .addCase(updateContact.pending, (state) => {
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        const index = state.contacts.findIndex((contact) => contact.id === action.payload.id);
        if (index >= 0) state.contacts[index] = action.payload;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.error = action.error.message ?? 'Could not update contact';
      })
      .addCase(deleteContacts.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteContacts.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload.deletedIds);
        state.contacts = state.contacts.filter((contact) => !deletedIds.has(contact.id));
        if (state.selectedContactId && deletedIds.has(state.selectedContactId)) {
          state.selectedContactId = null;
        }
        state.error = action.payload.errors.length ? action.payload.errors.join('; ') : null;
      })
      .addCase(deleteCompanies.fulfilled, (state, action) => {
        const deletedCompanyIds = new Set(action.payload.deletedIds);
        state.contacts.forEach((contact) => {
          if (contact.companyId && deletedCompanyIds.has(contact.companyId)) {
            contact.companyId = null;
          }
        });
      })
      .addCase(logout, () => initialState);
  },
});

export const { setSelectedContactId } = contactSlice.actions;
export default contactSlice.reducer;
