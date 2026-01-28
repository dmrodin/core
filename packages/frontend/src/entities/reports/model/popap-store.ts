import { create } from 'zustand';

interface PopapState {
    active: boolean;
    toggleActive: () => void;
    setActive: (value: boolean) => void;
}

export const usePopapStore = create<PopapState>((set) => ({
    active: false,
    toggleActive: () => set((state) => ({ active: !state.active })),
    setActive: (value) => set({ active: value }),
}));
