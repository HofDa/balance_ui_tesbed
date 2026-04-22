export type JourneyScene = 'facade' | 'transition' | 'bathroom';

export type BathroomObjectId = 'shower' | 'washingMachine' | 'toilet';

export type OptionValue = string | number;

export interface InputOption {
  value: OptionValue;
  label: string;
  hint?: string;
}

export type QuestionInput =
  | {
      type: 'chips' | 'segmented';
      options: InputOption[];
    }
  | {
      type: 'slider';
      min: number;
      max: number;
      step: number;
      unit: string;
      marks?: InputOption[];
    };

export interface BathroomObjectConfig {
  id: BathroomObjectId;
  label: string;
  shortLabel: string;
  iconSrc: string;
  prompt: string;
  helpText: string;
  position: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
  input: QuestionInput;
  completionCopy: string;
}

export interface BathroomAnswer {
  value: OptionValue;
  label: string;
  updatedAt: string;
}
