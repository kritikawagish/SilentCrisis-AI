/**
 * SilentCrisis AI — Personal Baseline Engine
 *
 * Computes a personal baseline from historical check-in data.
 * After 14 days, the baseline is considered "established."
 * Before that, it blends personal data with population defaults.
 *
 * Each signal gets:
 *   - mean: rolling average
 *   - std: standard deviation
 *   - trend: linear regression slope over last 7 data points
 */

import type { SignalInput, BaselineProfile, SignalBaseline } from './riskEngine';
import { DEFAULT_BASELINE } from './riskEngine';

// ─── Statistics Helpers ──────────────────────────────────────────

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const squaredDiffs = values.map(v => (v - m) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1));
}

function linearSlope(values: number[]): number {
  if (values.length < 3) return 0;
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = mean(values);

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  return denominator === 0 ? 0 : numerator / denominator;
}

// ─── Compute Baseline from History ───────────────────────────────

export function computeBaseline(history: SignalInput[]): BaselineProfile {
  const daysTracked = history.length;

  if (daysTracked === 0) {
    return { ...DEFAULT_BASELINE, days_tracked: 0 };
  }

  const signalKeys: (keyof SignalInput)[] = [
    'sleep_hours', 'meetings', 'response_time_min',
    'breaks', 'mood_score', 'task_switches'
  ];

  const baseline: Partial<BaselineProfile> = { days_tracked: daysTracked };

  for (const key of signalKeys) {
    const values = history.map(h => h[key]);
    const recentValues = values.slice(-7); // last 7 for trend

    const personalMean = mean(values);
    const personalStd = Math.max(stdDev(values), 0.01); // floor to avoid div/0
    const trend = linearSlope(recentValues);

    // If we have < 14 days, blend with population defaults
    if (daysTracked < 14) {
      const blendWeight = daysTracked / 14;
      const defaultBl = DEFAULT_BASELINE[key];

      (baseline as any)[key] = {
        mean: personalMean * blendWeight + defaultBl.mean * (1 - blendWeight),
        std: personalStd * blendWeight + defaultBl.std * (1 - blendWeight),
        trend,
      } as SignalBaseline;
    } else {
      (baseline as any)[key] = {
        mean: personalMean,
        std: personalStd,
        trend,
      } as SignalBaseline;
    }
  }

  return baseline as BaselineProfile;
}

// ─── Baseline Status ─────────────────────────────────────────────

export function getBaselineStatus(daysTracked: number): {
  established: boolean;
  progress: number; // 0-100
  message: string;
} {
  if (daysTracked >= 14) {
    return {
      established: true,
      progress: 100,
      message: 'Baseline established. Monitoring active.',
    };
  }

  const progress = Math.round((daysTracked / 14) * 100);
  return {
    established: false,
    progress,
    message: `Baseline learning: day ${daysTracked} of 14. ${14 - daysTracked} days remaining.`,
  };
}
