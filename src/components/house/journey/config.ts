import type { BathroomObjectConfig } from './types';

export const BATHROOM_OBJECTS: BathroomObjectConfig[] = [
  {
    id: 'shower',
    label: 'Dusche',
    shortLabel: 'Dusche',
    iconSrc: '/assets/shower_base.svg',
    prompt: 'Wie lange dauert deine typische Dusche?',
    helpText: 'Eine grobe Schätzung reicht vollkommen aus.',
    position: { top: '12%', left: '7%', width: '27%', height: '46%' },
    input: {
      type: 'segmented',
      options: [
        { value: 4, label: 'Kurz', hint: 'bis ca. 4 Min' },
        { value: 8, label: 'Mittel', hint: 'ca. 8 Min' },
        { value: 12, label: 'Lang', hint: 'ab ca. 12 Min' },
      ],
    },
    completionCopy: 'Dusche gespeichert.',
  },
  {
    id: 'washingMachine',
    label: 'Waschmaschine',
    shortLabel: 'WaMa',
    iconSrc: '/assets/washingMachine_base.svg',
    prompt: 'Wie viele Waschgänge laufen bei dir pro Woche?',
    helpText: 'Wähle den Bereich, der am besten passt.',
    position: { top: '57%', left: '14%', width: '23%', height: '32%' },
    input: {
      type: 'chips',
      options: [
        { value: 1, label: '1-2' },
        { value: 3, label: '3-4' },
        { value: 6, label: '5+' },
      ],
    },
    completionCopy: 'Waschmaschine erfasst.',
  },
  {
    id: 'toilet',
    label: 'Toilette',
    shortLabel: 'Toilette',
    iconSrc: '/assets/toilet_base.svg',
    prompt: 'Wie oft wird die Spülung durchschnittlich pro Tag genutzt?',
    helpText: 'Auch hier reicht ein Näherungswert.',
    position: { top: '52%', left: '64%', width: '21%', height: '31%' },
    input: {
      type: 'slider',
      min: 1,
      max: 12,
      step: 1,
      unit: 'Spülungen',
      marks: [
        { value: 3, label: 'niedrig' },
        { value: 6, label: 'mittel' },
        { value: 10, label: 'hoch' },
      ],
    },
    completionCopy: 'Toilette gespeichert.',
  },
];

export const DECORATIVE_BATHROOM_OBJECTS = [
  {
    id: 'sink-decoration',
    label: 'Waschbecken',
    iconSrc: '/assets/sink_base.svg',
    position: { top: '43%', left: '44%', width: '12%', height: '34%' },
  },
  {
    id: 'bathtub-decoration',
    label: 'Badewanne',
    iconSrc: '/assets/bathtube_base.svg',
    position: { top: '74%', left: '47%', width: '34%', height: '19%' },
  },
];
