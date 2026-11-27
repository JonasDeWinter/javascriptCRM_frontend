import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CrmPage } from '../../types/crm';
import { logout } from '../auth/authSlice';

export interface SiteSettingsState {
  isModalOpen: boolean;
  currentPage: CrmPage;
}

const initialState: SiteSettingsState = {
  isModalOpen: false,
  currentPage: CrmPage.Contacts,
};

const siteSettingsSlice = createSlice({
  name: 'siteSettings',
  initialState,
  reducers: {
    openModal(state) {
      state.isModalOpen = true;
    },
    closeModal(state) {
      state.isModalOpen = false;
    },
    setCurrentPage(state, action: PayloadAction<CrmPage>) {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const { closeModal, openModal, setCurrentPage } = siteSettingsSlice.actions;
export default siteSettingsSlice.reducer;
