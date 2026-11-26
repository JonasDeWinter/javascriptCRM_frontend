import { useAppSelector } from './reduxHooks';

export const useIsModalOpen = () => useAppSelector((state) => state.siteSettings.isModalOpen);
export const useCurrentPage = () => useAppSelector((state) => state.siteSettings.currentPage);
