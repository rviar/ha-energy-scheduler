/**
 * Global type declarations
 */

import type { Chart } from 'chart.js';
import type { EnergySchedulerCard } from '@/components/energy-scheduler-card';
import type { EnergySchedulerCardEditor } from '@/components/energy-scheduler-card-editor';

declare global {
  interface Window {
    Chart?: typeof Chart;
    EnergySchedulerCard?: typeof EnergySchedulerCard;
    EnergySchedulerCardEditor?: typeof EnergySchedulerCardEditor;
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}

export {};
