import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company } from '../../types/crm';
import { initialCompanies } from '../../utils/seedData';

export interface CompanyUpdate {
  id: string;
  changes: Partial<Omit<Company, 'id'>>;
}

const companySlice = createSlice({
  name: 'companies',
  initialState: initialCompanies,
  reducers: {
    addCompany(state, action: PayloadAction<Company>) {
      state.unshift(action.payload);
    },
    deleteCompanies(state, action: PayloadAction<string[]>) {
      const deletedIds = new Set(action.payload);
      return state.filter((company) => !deletedIds.has(company.id));
    },
    updateCompany(state, action: PayloadAction<CompanyUpdate>) {
      const company = state.find((item) => item.id === action.payload.id);
      if (company) {
        Object.assign(company, action.payload.changes);
      }
    },
  },
});

export const { addCompany, deleteCompanies, updateCompany } = companySlice.actions;
export default companySlice.reducer;
