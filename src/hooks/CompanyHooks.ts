import { Company } from '../types/company';
import { useAppSelector } from './reduxHooks';

export const useCompanyData: () => Company[] = () => {
  return useAppSelector(
    (state) => state.companies.companies
  );
}