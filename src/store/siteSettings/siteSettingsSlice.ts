import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CrmPage } from '../../types/crm';

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
});

export const { closeModal, openModal, setCurrentPage } = siteSettingsSlice.actions;
export default siteSettingsSlice.reducer;
