import { create } from 'zustand';
import { Application } from '../types';

interface ApplicationState {
  isAddModalOpen: boolean;
  selectedApplication: Application | null;
  setIsAddModalOpen: (isOpen: boolean) => void;
  setSelectedApplication: (app: Application | null) => void;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  isAddModalOpen: false,
  selectedApplication: null,
  setIsAddModalOpen: (isOpen) => set({ isAddModalOpen: isOpen }),
  setSelectedApplication: (app) => set({ selectedApplication: app }),
}));
