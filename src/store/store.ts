import { configureStore } from '@reduxjs/toolkit';
import companiesReducer from './company/companySlice';
import contactsReducer from './contact/contactSlice';
import siteSettingsReducer from './siteSettings/siteSettingsSlice';

export const createAppStore = () =>
  configureStore({
    reducer: {
      contacts: contactsReducer,
      companies: companiesReducer,
      siteSettings: siteSettingsReducer,
    },
  });

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
