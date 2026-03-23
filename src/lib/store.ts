/**
 * lib/store.ts
 * Lightweight global state via Zustand.
 * Keeps map filters, selected station, and auth user in sync across components.
 */

import { create } from 'zustand';
import type { Station, AppUser, MapFilters } from '@/types';

interface AppState {
  // ── Auth ──────────────────────────────────────────────────────────────────
  user:       AppUser | null;
  setUser:    (u: AppUser | null) => void;

  // ── Map / Stations ────────────────────────────────────────────────────────
  stations:         Station[];
  selectedStation:  Station | null;
  filters:          MapFilters;
  userLocation:     { lat: number; lng: number } | null;

  setStations:        (s: Station[]) => void;
  setSelectedStation: (s: Station | null) => void;
  setFilters:         (f: Partial<MapFilters>) => void;
  setUserLocation:    (loc: { lat: number; lng: number } | null) => void;

  // ── UI ────────────────────────────────────────────────────────────────────
  darkMode:      boolean;
  toggleDarkMode: () => void;

  bottomSheetOpen: boolean;
  setBottomSheetOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user:            null,
  setUser:         (user) => set({ user }),

  stations:         [],
  selectedStation:  null,
  filters:          {},
  userLocation:     null,

  setStations:        (stations) => set({ stations }),
  setSelectedStation: (selectedStation) => set({ selectedStation, bottomSheetOpen: !!selectedStation }),
  setFilters:         (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  setUserLocation:    (userLocation) => set({ userLocation }),

  darkMode:       false,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  bottomSheetOpen:    false,
  setBottomSheetOpen: (bottomSheetOpen) => set({ bottomSheetOpen }),
}));
