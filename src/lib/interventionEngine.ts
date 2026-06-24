/**
 * SilentCrisis — Intervention Matching Engine
 *
 * Selects the lightest effective intervention based on:
 * 1. Risk tier (WATCHING → ELEVATED → CRITICAL)
 * 2. Top deviating signal pattern
 * 3. User's intervention history (what they've engaged with before)
 *
 * Backed by CBT, ACT, and mindfulness evidence base.
 */

import type { RiskTier, SignalDeviation } from './riskEngine';

export interface Intervention {
  id: string;
  title: string;
  duration: string;
  description: string;
  tier: 'Level 1' | 'Level 2' | 'Level 3';
  category: 'breathing' | 'cognitive' | 'calendar' | 'social' | 'reflection' | 'professional';
  triggerSignals: string[];     // which signals this intervention targets
  instructions?: string[];     // step-by-step guide
}

// ─── Intervention Library ────────────────────────────────────────

export const INTERVENTION_LIBRARY: Intervention[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    duration: '4 min',
    description: 'Slow cardiac coherence reset. Activates parasympathetic nervous system to reduce acute stress.',
    tier: 'Level 1',
    category: 'breathing',
    triggerSignals: ['response_time_min', 'task_switches', 'mood_score'],
    instructions: [
      'Find a comfortable position. Close your eyes if that feels right.',
      'Inhale slowly through your nose for 4 seconds.',
      'Hold your breath gently for 4 seconds.',
      'Exhale slowly through your mouth for 4 seconds.',
      'Hold empty for 4 seconds.',
      'Repeat for 4 cycles. Notice the quiet.',
    ],
  },
  {
    id: 'cognitive-reframe',
    title: 'Cognitive Reframe',
    duration: '6 min',
    description: 'Guided thought restructuring for rumination patterns. Based on CBT cognitive restructuring protocol.',
    tier: 'Level 2',
    category: 'cognitive',
    triggerSignals: ['mood_score', 'sleep_hours'],
    instructions: [
      'Name one thought that has been circling in your mind today.',
      'Write it down exactly as your mind says it.',
      'Ask: "Is this thought a fact, or an interpretation?"',
      'Ask: "What would I say to a friend thinking this?"',
      'Write a more balanced version of the thought.',
      'Notice how the reframe feels in your body.',
    ],
  },
  {
    id: 'calendar-protect',
    title: 'Calendar Protect',
    duration: 'instant',
    description: 'Block 90 minutes of recovery time on your most overloaded day this week.',
    tier: 'Level 1',
    category: 'calendar',
    triggerSignals: ['meetings', 'breaks'],
    instructions: [
      'Look at your calendar for the next 3 days.',
      'Find the day with the most back-to-back meetings.',
      'Block a 90-minute "Focus Time" block on that day.',
      'Set it as "busy" — no meeting can overwrite it.',
      'Use the time for a walk, rest, or single-task deep work.',
    ],
  },
  {
    id: 'reflection-prompt',
    title: 'Reflection Prompt',
    duration: '3 min',
    description: 'A single, gentle question delivered at the right moment. Based on ACT defusion techniques.',
    tier: 'Level 1',
    category: 'reflection',
    triggerSignals: ['mood_score', 'response_time_min'],
    instructions: [
      'Pause for 30 seconds. Take one deep breath.',
      'Consider this question:',
      '"What is one thing I am carrying right now that I could set down — even briefly?"',
      'Don\'t answer it analytically. Let it sit.',
      'Notice what surfaces.',
    ],
  },
  {
    id: 'connection-nudge',
    title: 'Connection Nudge',
    duration: '—',
    description: 'Gentle suggestion to reach out to a trusted person. Social connection is a buffer against isolation.',
    tier: 'Level 2',
    category: 'social',
    triggerSignals: ['response_time_min', 'breaks', 'mood_score'],
    instructions: [
      'Think of one person who makes you feel genuinely heard.',
      'Send them a brief message — even just "hey, thinking of you."',
      'No expectation of a deep conversation. Just connection.',
      'Social contact reduces cortisol by up to 20% (meta-analysis).',
    ],
  },
  {
    id: 'sleep-reset',
    title: 'Sleep Window Reset',
    duration: '10 min tonight',
    description: 'Guided wind-down protocol to reset drifting sleep onset. Addresses the #1 early-warning signal.',
    tier: 'Level 2',
    category: 'reflection',
    triggerSignals: ['sleep_hours'],
    instructions: [
      'Set a target bedtime tonight that is 30 min earlier than last night.',
      'One hour before bed: no screens. Dim lights.',
      '30 minutes before bed: write down 3 things from today (any 3).',
      '15 minutes before bed: box breathing (4 cycles).',
      'In bed: body scan from feet to head. Notice without fixing.',
    ],
  },
  {
    id: 'professional-handoff',
    title: 'Professional Connection',
    duration: 'on your schedule',
    description: 'Your patterns suggest this may benefit from professional support. This is a sign of strength, not weakness.',
    tier: 'Level 3',
    category: 'professional',
    triggerSignals: ['mood_score', 'sleep_hours', 'response_time_min', 'breaks'],
    instructions: [
      'Your sustained pattern shifts suggest professional support could help.',
      'This is not a diagnosis — it is an observation that care could make a difference.',
      'Options: your primary care physician, a licensed therapist, or your EAP.',
      'If in immediate crisis: 988 Suicide & Crisis Lifeline (call or text 988).',
      'You are not alone. Reaching out is the bravest signal of all.',
    ],
  },
];

// ─── Match Intervention to Risk ──────────────────────────────────

export function selectIntervention(
  tier: RiskTier,
  deviations: SignalDeviation[],
  previousInterventions: string[] = []
): Intervention {
  // Get the top deviating signal
  const worseSignals = deviations
    .filter(d => d.direction === 'worse')
    .sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score))
    .map(d => d.signal);

  // Map tier to allowed intervention levels
  const tierMap: Record<RiskTier, string[]> = {
    'WATCHING': ['Level 1'],
    'ELEVATED': ['Level 1', 'Level 2'],
    'CRITICAL': ['Level 1', 'Level 2', 'Level 3'],
  };

  const allowedLevels = tierMap[tier];

  // Score each intervention based on signal match
  const scored = INTERVENTION_LIBRARY
    .filter(i => allowedLevels.includes(i.tier))
    .map(intervention => {
      let score = 0;

      // Signal match bonus (primary factor)
      for (const signal of worseSignals) {
        if (intervention.triggerSignals.includes(signal)) {
          score += 10;
        }
      }

      // Prefer higher-tier interventions for higher risk
      if (tier === 'CRITICAL' && intervention.tier === 'Level 3') score += 5;
      if (tier === 'ELEVATED' && intervention.tier === 'Level 2') score += 3;

      // Variety bonus: prefer interventions not recently used
      if (previousInterventions.includes(intervention.id)) score -= 3;

      return { intervention, score };
    })
    .sort((a, b) => b.score - a.score);

  // Return the best match, or a default
  return scored[0]?.intervention || INTERVENTION_LIBRARY[0];
}
