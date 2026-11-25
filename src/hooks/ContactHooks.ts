import { Contact } from '../types/contact';
import { useAppSelector } from './reduxHooks';

export const useContactData: () => Contact[] = () => {
  return useAppSelector(
    (state) => state.contacts.contacts
  );
}

export const useSelectedContactId = () => {
  return useAppSelector((state) => state.contacts.selectedContactId);
};

