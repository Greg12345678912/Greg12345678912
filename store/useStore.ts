import { create } from "zustand";

export type Category = "sundaes" | "softserve" | "hardice" | "drinks" | "churros" | "seasonal";

export interface MenuItem {
  id: string;
  name: string;
  nameFr: string;
  price: number;
  description: string;
  category: Category;
  color: string;
  accentColor: string;
  flavorProfile: string[];
}

interface AppState {
  activeCategory: Category;
  selectedItem: MenuItem | null;
  isMenuOpen: boolean;
  isLoading: boolean;
  cursorVariant: "default" | "hover" | "click";
  audioEnabled: boolean;

  setActiveCategory: (cat: Category) => void;
  setSelectedItem: (item: MenuItem | null) => void;
  setMenuOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCursorVariant: (variant: "default" | "hover" | "click") => void;
  toggleAudio: () => void;
}

export const useStore = create<AppState>((set) => ({
  activeCategory: "sundaes",
  selectedItem: null,
  isMenuOpen: false,
  isLoading: true,
  cursorVariant: "default",
  audioEnabled: false,

  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCursorVariant: (variant) => set({ cursorVariant: variant }),
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
}));
