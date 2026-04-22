import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

let registered = false;

if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(useGSAP);
  registered = true;
}
