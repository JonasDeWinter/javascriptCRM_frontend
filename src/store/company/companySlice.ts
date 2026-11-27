import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company } from '../../types/company';
import { CompanyInput, crmApi } from '../../services/crmApi';
import { logout } from '../auth/authSlice';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface CompanyState {
  companies: Company[];
  selectedCompanyId: string | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  selectedCompanyId: null,
  status: 'idle',
  error: null,
};

export const fetchCompanies = createAsyncThunk('companies/fetchAll', crmApi.getCompanies);
export const createCompany = createAsyncThunk(
  'companies/create',
  (input: CompanyInput) => crmApi.createCompany(input)
);
export const updateCompany = createAsyncThunk(
  'companies/update',
  ({ id, changes }: { id: string; changes: Partial<CompanyInput> }) => crmApi.updateCompany(id, changes)
);
export const deleteCompanies = createAsyncThunk(
  'companies/deleteMany',
  async (ids: string[]) => {
    const results = await Promise.allSettled(ids.map(async (id) => {
      await crmApi.deleteCompany(id);
      return id;
    }));
    return {
      deletedIds: results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []),
      errors: results.flatMap((result) => (
        result.status === 'rejected'
          ? [result.reason instanceof Error ? result.reason.message : 'Could not delete company']
          : []
      )),
    };
  }
);

const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setSelectedCompanyId(state, action: PayloadAction<string | null>) {
      state.selectedCompanyId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Could not load companies';
      })
      .addCase(createCompany.pending, (state) => {
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.companies.unshift(action.payload);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.error = action.error.message ?? 'Could not create company';
      })
      .addCase(updateCompany.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex((company) => company.id === action.payload.id);
        if (index >= 0) state.companies[index] = action.payload;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.error = action.error.message ?? 'Could not update company';
      })
      .addCase(deleteCompanies.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteCompanies.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload.deletedIds);
        state.companies = state.companies.filter((company) => !deletedIds.has(company.id));
        if (state.selectedCompanyId && deletedIds.has(state.selectedCompanyId)) {
          state.selectedCompanyId = null;
        }
        state.error = action.payload.errors.length ? action.payload.errors.join('; ') : null;
      })
      .addCase(logout, () => initialState);
  },
});

export const { setSelectedCompanyId } = companySlice.actions;
export default companySlice.reducer;
