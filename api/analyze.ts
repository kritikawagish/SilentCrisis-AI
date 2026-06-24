import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Inline the core engines (serverless can't import from src/) ──

// AFINN subset for sentiment
const AFINN: Record<string, number> = {
  'abandon': -2, 'abandoned': -2, 'abuse': -3, 'afraid': -2, 'agony': -3,
  'alone': -2, 'angry': -3, 'anxious': -2, 'awful': -3, 'bad': -3,
  'bitter': -2, 'bored': -2, 'broken': -2, 'burnout': -3, 'cant': -1,
  'collapse': -2, 'confused': -2, 'crash': -2, 'crisis': -3, 'crushed': -2,
  'cry': -2, 'depressed': -4, 'depression': -4, 'despair': -4,
  'desperate': -3, 'devastated': -4, 'difficult': -1, 'disappointed': -2,
  'disaster': -3, 'distress': -3, 'drained': -2, 'dread': -3, 'drowning': -3,
  'empty': -2, 'exhausted': -3, 'fail': -2, 'failed': -2, 'failure': -2,
  'fear': -2, 'frustrated': -2, 'furious': -3, 'grief': -3, 'guilty': -3,
  'hard': -1, 'hate': -3, 'helpless': -2, 'hopeless': -3, 'horrible': -3,
  'hurt': -2, 'isolated': -2, 'lonely': -2, 'lose': -2, 'lost': -2,
  'mad': -2, 'miserable': -3, 'numb': -2, 'overwhelmed': -3, 'pain': -2,
  'painful': -2, 'panic': -3, 'pathetic': -2, 'pointless': -2, 'pressure': -1,
  'problem': -2, 'problems': -2, 'rage': -3, 'sad': -2, 'scared': -2,
  'sick': -2, 'stressed': -2, 'struggle': -2, 'struggling': -2, 'stuck': -2,
  'suffer': -2, 'terrible': -3, 'terrified': -3, 'tired': -2, 'toxic': -3,
  'trapped': -2, 'unhappy': -2, 'upset': -2, 'useless': -2, 'weak': -2,
  'worried': -2, 'worse': -2, 'worst': -3, 'worthless': -3, 'wrong': -2,
  // Positive
  'amazing': 4, 'awesome': 4, 'balanced': 2, 'beautiful': 3, 'best': 3,
  'better': 1, 'blessed': 3, 'calm': 2, 'cheerful': 2, 'comfortable': 2,
  'confident': 2, 'content': 2, 'creative': 2, 'delight': 3, 'enjoy': 2,
  'excellent': 3, 'excited': 3, 'fantastic': 4, 'fine': 1, 'focused': 2,
  'free': 1, 'glad': 2, 'good': 2, 'grateful': 3, 'great': 3, 'happy': 3,
  'healthy': 2, 'hope': 2, 'hopeful': 2, 'improved': 2, 'incredible': 4,
  'inspired': 3, 'joy': 3, 'kind': 2, 'love': 3, 'loved': 3, 'lucky': 2,
  'motivated': 2, 'nice': 2, 'ok': 1, 'okay': 1, 'optimistic': 2,
  'outstanding': 5, 'peaceful': 2, 'perfect': 3, 'pleased': 2, 'positive': 2,
  'productive': 2, 'progress': 2, 'proud': 2, 'ready': 1, 'recovered': 2,
  'relaxed': 2, 'relief': 2, 'rested': 2, 'safe': 1, 'satisfied': 2,
  'smile': 2, 'stable': 1, 'strong': 2, 'success': 3, 'super': 3,
  'support': 2, 'thankful': 2, 'thriving': 3, 'warm': 1, 'well': 1,
  'wonderful': 4, 'worthy': 2,
};

function analyzeSentiment(text: string) {
  const tokens = text.toLowerCase().replace(/[^a-z\s']/g, ' ').split(/\s+/).filter(t => t.length > 0);
  let score = 0;
  const negativeWords: string[] = [];
  const positiveWords: string[] = [];

  for (const word of tokens) {
    if (AFINN[word] !== undefined) {
      score += AFINN[word];
      if (AFINN[word] < 0) negativeWords.push(word);
      else if (AFINN[word] > 0) positiveWords.push(word);
    }
  }

  const comparative = tokens.length > 0 ? score / tokens.length : 0;
  const moodScore = Math.min(100, Math.max(0, 50 + comparative * 25));

  return {
    score: Math.round(score * 100) / 100,
    comparative: Math.round(comparative * 1000) / 1000,
    mood_score: Math.round(moodScore * 10) / 10,
    positive_words: [...new Set(positiveWords)],
    negative_words: [...new Set(negativeWords)],
    word_count: tokens.length,
  };
}

// Risk engine (inline)
interface SignalInput {
  sleep_hours: number;
  meetings: number;
  response_time_min: number;
  breaks: number;
  mood_score: number;
  task_switches: number;
}

const WEIGHTS: Record<string, number> = {
  sleep_hours: 0.25, meetings: 0.15, response_time_min: 0.15,
  breaks: 0.15, mood_score: 0.20, task_switches: 0.10,
};

const HIGHER_IS_WORSE: Record<string, boolean> = {
  sleep_hours: false, meetings: true, response_time_min: true,
  breaks: false, mood_score: false, task_switches: true,
};

const DEFAULT_BL: Record<string, { mean: number; std: number }> = {
  sleep_hours: { mean: 7.2, std: 0.8 },
  meetings: { mean: 4.0, std: 1.5 },
  response_time_min: { mean: 15.0, std: 8.0 },
  breaks: { mean: 3.0, std: 1.0 },
  mood_score: { mean: 72.0, std: 10.0 },
  task_switches: { mean: 12.0, std: 4.0 },
};

function computeRiskAPI(input: SignalInput, baseline?: any) {
  const bl = baseline || DEFAULT_BL;
  const signals = Object.keys(WEIGHTS).map(key => {
    const value = (input as any)[key];
    const b = bl[key] || DEFAULT_BL[key];
    const rawZ = b.std > 0 ? (value - b.mean) / b.std : 0;
    const directionalZ = HIGHER_IS_WORSE[key] ? rawZ : -rawZ;
    const clampedZ = Math.max(0, directionalZ);
    const weightedZ = clampedZ * WEIGHTS[key];
    const status = Math.abs(clampedZ) < 1 ? 'normal' : Math.abs(clampedZ) < 2 ? 'watching' : 'elevated';
    return {
      signal: key, value, baseline_mean: b.mean, baseline_std: b.std,
      z_score: Math.round(directionalZ * 100) / 100,
      weighted_z: Math.round(weightedZ * 1000) / 1000,
      direction: clampedZ > 0.5 ? 'worse' : directionalZ < -0.5 ? 'better' : 'neutral',
      status,
    };
  });

  const deviatingCount = signals.filter(s => s.direction === 'worse' && Math.abs(s.z_score) > 1).length;
  const clusterFactor = deviatingCount <= 1 ? 0.8 : deviatingCount === 2 ? 1.0 : deviatingCount === 3 ? 1.2 : 1.4;
  const rawScore = signals.reduce((sum, s) => sum + s.weighted_z, 0);
  const riskIndex = Math.min(100, Math.max(0, rawScore * 40 * clusterFactor));
  const tier = riskIndex < 40 ? 'WATCHING' : riskIndex < 70 ? 'ELEVATED' : 'CRITICAL';

  const topSignal = signals.filter(s => s.direction === 'worse').sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score))[0];

  const interventions: Record<string, Record<string, string>> = {
    WATCHING: { sleep_hours: 'Sleep hygiene reminder', meetings: 'Calendar audit', default: 'Micro-break prompt' },
    ELEVATED: { sleep_hours: 'Sleep reset protocol', meetings: 'Calendar protect — 90min block', mood_score: 'Cognitive reframe exercise', default: 'Box breathing — 4 min' },
    CRITICAL: { sleep_hours: 'Professional sleep consultation', mood_score: 'Professional therapist connection', default: 'Professional handoff recommended' },
  };

  const intMap = interventions[tier] || interventions['WATCHING'];
  const intervention = (topSignal && intMap[topSignal.signal]) || intMap['default'] || 'Box breathing';

  return {
    risk_index: Math.round(riskIndex * 10) / 10,
    tier,
    convergence_count: deviatingCount,
    temporal_cluster_factor: Math.round(clusterFactor * 100) / 100,
    signals,
    recommended_intervention: intervention,
    explanation: `Risk index ${Math.round(riskIndex)} (${tier}). ${deviatingCount} signal(s) deviating from baseline.`,
    timestamp: new Date().toISOString(),
  };
}

// ─── Handler ─────────────────────────────────────────────────────

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { signals, baseline } = req.body || {};

    if (!signals) {
      return res.status(400).json({
        error: 'Missing "signals" in request body.',
        example: {
          signals: {
            sleep_hours: 5.2,
            meetings: 8,
            response_time_min: 45,
            breaks: 1,
            mood_text: 'feeling exhausted and overwhelmed',
            task_switches: 22,
          },
        },
      });
    }

    // If mood_text is provided, compute sentiment and use it as mood_score
    let sentimentResult = null;
    let moodScore = signals.mood_score || 65;

    if (signals.mood_text && typeof signals.mood_text === 'string' && signals.mood_text.trim()) {
      sentimentResult = analyzeSentiment(signals.mood_text);
      moodScore = sentimentResult.mood_score;
    }

    const input: SignalInput = {
      sleep_hours: Number(signals.sleep_hours) || 7,
      meetings: Number(signals.meetings) || 4,
      response_time_min: Number(signals.response_time_min) || 15,
      breaks: Number(signals.breaks) || 3,
      mood_score: moodScore,
      task_switches: Number(signals.task_switches) || 10,
    };

    const result = computeRiskAPI(input, baseline);

    return res.status(200).json({
      ...result,
      sentiment: sentimentResult,
      engine: 'SilentCrisis Risk Engine v1.0',
      model: 'Z-score deviation + convergence clustering + temporal analysis',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal computation error',
      message: error.message,
    });
  }
}
