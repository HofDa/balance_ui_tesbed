import { create } from 'zustand';
import type { BathroomAnswer, BathroomObjectId, JourneyScene } from '@/components/house/journey/types';

interface FootprintState {
  roof: { hasSolar: boolean; rainHarvesting: boolean };
  bathroom: { washingMachineCycles: number; showerDuration: number };
  journey: {
    scene: JourneyScene;
    bathroomAnswers: Partial<Record<BathroomObjectId, BathroomAnswer>>;
  };
  updateRoof: (data: Partial<{ hasSolar: boolean; rainHarvesting: boolean }>) => void;
  updateBathroom: (data: Partial<{ washingMachineCycles: number; showerDuration: number }>) => void;
  setJourneyScene: (scene: JourneyScene) => void;
  saveBathroomAnswer: (id: BathroomObjectId, answer: BathroomAnswer) => void;
}

export const useFootprintStore = create<FootprintState>((set) => ({
  roof: { hasSolar: false, rainHarvesting: false },
  bathroom: { washingMachineCycles: 0, showerDuration: 0 },
  journey: {
    scene: 'facade',
    bathroomAnswers: {},
  },
  updateRoof: (data) => set((state) => ({ roof: { ...state.roof, ...data } })),
  updateBathroom: (data) => set((state) => ({ bathroom: { ...state.bathroom, ...data } })),
  setJourneyScene: (scene) => set((state) => ({ journey: { ...state.journey, scene } })),
  saveBathroomAnswer: (id, answer) =>
    set((state) => ({
      journey: {
        ...state.journey,
        bathroomAnswers: {
          ...state.journey.bathroomAnswers,
          [id]: answer,
        },
      },
    })),
}));
