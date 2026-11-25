import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company } from '../../types/company';
import { initialCompanies } from '../../utils/seedData';

export interface CompanyUpdate {
  changes: Partial<Omit<Company, 'id'>>;
}

export interface CompanyState {
  companies: Company[];
  selectedCompanyId: string | null;
}

const initialState: CompanyState = {
  companies: initialCompanies,
  selectedCompanyId: null,
};

const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    addCompany(state, action: PayloadAction<Company>) {
      state.companies.unshift(action.payload);
    },
    setSelectedCompanyId(state, action: PayloadAction<string | null>) {
      state.selectedCompanyId = action.payload;
    },
    deleteCompanies(state, action: PayloadAction<string[]>) {
      const deletedIds = new Set(action.payload);
      state.companies = state.companies.filter((company) => !deletedIds.has(company.id));
      if (state.selectedCompanyId && deletedIds.has(state.selectedCompanyId)) {
        state.selectedCompanyId = null;
      }
    },
    updateCompany(state, action: PayloadAction<CompanyUpdate>) {
      const company = state.companies.find((item) => item.id === state.selectedCompanyId);
      if (company) {
        Object.assign(company, action.payload.changes);
      }
    },
  },
});

export const { addCompany, deleteCompanies, setSelectedCompanyId, updateCompany } = companySlice.actions;
export default companySlice.reducer;
