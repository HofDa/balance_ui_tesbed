'use client';

import styles from './JourneyLayout.module.css';
import BathroomScene from './journey/BathroomScene';
import HouseFacadeScene from './journey/HouseFacadeScene';
import { useFootprintStore } from '@/store/useFootprintStore';

export default function HouseWrapper() {
  const scene = useFootprintStore((state) => state.journey.scene);
  const setJourneyScene = useFootprintStore((state) => state.setJourneyScene);

  return (
    <div className={styles.journeyRoot}>
      <div className={styles.sceneFrame}>
        {scene === 'facade' ? (
          <HouseFacadeScene onEnterBathroom={() => setJourneyScene('bathroom')} />
        ) : null}

        {scene === 'bathroom' ? (
          <BathroomScene onBack={() => setJourneyScene('facade')} />
        ) : null}
      </div>
    </div>
  );
}
