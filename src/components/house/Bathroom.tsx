"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function Bathroom() {
  const washerRef = useRef(null);

  // Kleiner Gag: Die Waschmaschine wackelt, wenn man drüber fährt
  const { contextSafe } = useGSAP();
  
  // eslint-disable-next-line react-hooks/refs
  const shake = contextSafe(() => {
    gsap.to(washerRef.current, {
      x: "+=2",
      repeat: 5,
      yoyo: true,
      duration: 0.05
    });
  });

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Hotspot für Waschmaschine */}
      <div 
        ref={washerRef}
        onMouseEnter={shake}
        className="absolute top-[35%] left-[45%] w-[25%] h-[30%] pointer-events-auto cursor-pointer"
        title="Waschgang konfigurieren"
      >
        {/* Hier könnte ein SVG oder transparentes PNG der WaMa liegen */}
      </div>
    </div>
  );
}