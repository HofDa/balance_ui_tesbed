import { useEffect, useMemo, useState } from 'react';
import styles from './ObjectQuestionPanel.module.css';
import type { BathroomAnswer, BathroomObjectConfig, InputOption, OptionValue } from './types';

interface ObjectQuestionPanelProps {
  objectConfig: BathroomObjectConfig;
  existingAnswer?: BathroomAnswer;
  onClose: () => void;
  onSave: (answer: BathroomAnswer) => void;
}

function isOptionValue(value: OptionValue, candidate: OptionValue): boolean {
  return value === candidate;
}

function getDefaultValue(config: BathroomObjectConfig): OptionValue {
  if (config.input.type === 'slider') {
    return config.input.min;
  }

  return config.input.options[0]?.value ?? '';
}

function labelForValue(config: BathroomObjectConfig, value: OptionValue): string {
  if (config.input.type === 'slider') {
    const mark = config.input.marks?.find((candidate) => candidate.value === value);
    return mark ? `${String(value)} ${config.input.unit} (${mark.label})` : `${String(value)} ${config.input.unit}`;
  }

  const option = config.input.options.find((candidate) => isOptionValue(candidate.value, value));
  return option?.label ?? String(value);
}

function OptionHint({ option }: { option: InputOption }) {
  if (!option.hint) {
    return null;
  }

  return <span>{option.hint}</span>;
}

export default function ObjectQuestionPanel({
  objectConfig,
  existingAnswer,
  onClose,
  onSave,
}: ObjectQuestionPanelProps) {
  const [value, setValue] = useState<OptionValue>(() => existingAnswer?.value ?? getDefaultValue(objectConfig));

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onEscape);

    return () => window.removeEventListener('keydown', onEscape);
  }, [onClose]);

  const currentLabel = useMemo(() => labelForValue(objectConfig, value), [objectConfig, value]);

  return (
    <>
      <div className={styles.panelBackdrop} />
      <section
        className={styles.questionPanel}
        role="dialog"
        aria-modal="false"
        aria-labelledby={`panel-title-${objectConfig.id}`}
        aria-describedby={`panel-help-${objectConfig.id}`}
      >
        <div className={styles.panelHeader}>
          <div>
            <h3 id={`panel-title-${objectConfig.id}`} className={styles.panelTitle}>
              {objectConfig.prompt}
            </h3>
            <p id={`panel-help-${objectConfig.id}`} className={styles.panelHelp}>
              {objectConfig.helpText}
            </p>
          </div>
          <button
            type="button"
            className={styles.closePanelButton}
            onClick={onClose}
            aria-label="Eingabedialog schließen"
          >
            ×
          </button>
        </div>

        {objectConfig.input.type === 'chips' ? (
          <div className={styles.optionsRow}>
            {objectConfig.input.options.map((option) => {
              const selected = isOptionValue(value, option.value);

              return (
                <button
                  key={`${objectConfig.id}-${String(option.value)}`}
                  type="button"
                  className={`${styles.optionButton} ${selected ? styles.optionButtonSelected : ''}`.trim()}
                  onClick={() => setValue(option.value)}
                  aria-pressed={selected}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}

        {objectConfig.input.type === 'segmented' ? (
          <div className={styles.segmentedGrid} role="radiogroup" aria-label={`${objectConfig.label} Auswahl`}>
            {objectConfig.input.options.map((option) => {
              const selected = isOptionValue(value, option.value);

              return (
                <button
                  key={`${objectConfig.id}-${String(option.value)}`}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`${styles.segmentButton} ${selected ? styles.segmentButtonSelected : ''}`.trim()}
                  onClick={() => setValue(option.value)}
                >
                  <strong>{option.label}</strong>
                  <OptionHint option={option} />
                </button>
              );
            })}
          </div>
        ) : null}

        {objectConfig.input.type === 'slider' ? (
          <div className={styles.sliderWrap}>
            <input
              className={styles.sliderInput}
              type="range"
              min={objectConfig.input.min}
              max={objectConfig.input.max}
              step={objectConfig.input.step}
              value={typeof value === 'number' ? value : objectConfig.input.min}
              onChange={(event) => setValue(Number(event.currentTarget.value))}
              aria-label={`${objectConfig.label} Wert`}
            />
            <p className={styles.sliderMeta}>Aktuell: {currentLabel}</p>
          </div>
        ) : null}

        <div className={styles.panelActions}>
          <p className={styles.microcopy}>Danke, das hilft für eine präzisere Einordnung.</p>
          <button
            type="button"
            className={styles.saveButton}
            onClick={() =>
              onSave({
                value,
                label: currentLabel,
                updatedAt: new Date().toISOString(),
              })
            }
          >
            Übernehmen
          </button>
        </div>
      </section>
    </>
  );
}
