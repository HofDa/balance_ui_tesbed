"use client";

import gsap from "gsap";
import { useFootprintStore } from "@/store/useFootprintStore";

export default function Roof() {
  const { roof, updateRoof } = useFootprintStore();
  const toggleRain = () => {
    const newState = !roof.rainHarvesting;
    updateRoof({ rainHarvesting: newState });

    if (newState) {
      // Startet die Tropfen-Animation
      gsap.to(".rain-drop", {
        y: 300,        // Falltiefe zur Zisterne
        opacity: 0,
        stagger: {
          each: 0.2,
          repeat: -1   // Endlosschleife
        },
        duration: 0.8,
        ease: "power1.in"
      });
    } else {
      // Stoppt die Animation
      gsap.killTweensOf(".rain-drop");
      gsap.set(".rain-drop", { y: 0, opacity: 0 });
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* Klickbare Zone für Regenrinne */}
      <div 
        onClick={(e) => { e.stopPropagation(); toggleRain(); }}
        className="absolute top-[35%] right-[5%] w-10 h-40 cursor-pointer pointer-events-auto group"
      >
        {/* Visuelle Regentropfen (initial unsichtbar) */}
        <div className="rain-drop absolute top-0 left-2 w-2 h-2 bg-blue-400 rounded-full opacity-0" />
        <div className="rain-drop absolute top-0 left-2 w-2 h-2 bg-blue-400 rounded-full opacity-0 translate-y-[-20px]" />
        
        <div className="text-[10px] text-white opacity-0 group-hover:opacity-100 bg-black/50 p-1 rounded">
          Regenwasser aktivieren
        </div>
      </div>
      
      {/* Visuelles Feedback für Solar */}
      {roof.hasSolar && (
        <div className="absolute top-[12%] right-[18%] w-[25%] h-[12%] bg-yellow-400/20 mix-blend-overlay animate-pulse pointer-events-none" />
      )}
    </div>
  );
}