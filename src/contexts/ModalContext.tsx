import React, { createContext, useState } from 'react';
import { CrmPage } from '../types/crm';

export interface ModalContextValue {
  isModalOpen: boolean;
  currentPage: CrmPage;
  setCurrentPage: React.Dispatch<React.SetStateAction<CrmPage>>;
  openModal: () => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextValue | undefined>(undefined);

interface ModalProviderProps {
  children: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<CrmPage>('contacts');

  const value: ModalContextValue = {
    isModalOpen,
    currentPage,
    setCurrentPage,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}
