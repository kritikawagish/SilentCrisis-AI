/**
 * SilentCrisis — Client-Side Sentiment Analysis Engine
 *
 * Uses AFINN-165 lexicon for real NLP sentiment scoring.
 * No API keys needed — runs entirely in the browser.
 *
 * Converts raw sentiment scores to a 0-100 "mood score"
 * that feeds into the risk engine.
 */

// ─── AFINN-165 Subset (most impactful words) ────────────────────
// Full AFINN-165 has 3382 entries. This is a curated subset of ~300
// covering the most common emotional language patterns.
// Score range: -5 (most negative) to +5 (most positive)

const AFINN: Record<string, number> = {
  // Strong negative (-5 to -3)
  'abandon': -2, 'abandoned': -2, 'abuse': -3, 'abused': -3, 'afraid': -2,
  'agony': -3, 'alone': -2, 'angry': -3, 'anguish': -3, 'annoyed': -2,
  'anxious': -2, 'apathy': -3, 'awful': -3, 'bad': -3, 'bitter': -2,
  'blame': -2, 'bored': -2, 'broken': -2, 'burden': -2, 'burnout': -3,
  'cant': -1, 'catastrophe': -4, 'collapse': -2, 'confused': -2,
  'crash': -2, 'cried': -2, 'crisis': -3, 'crushed': -2, 'cry': -2,
  'damn': -2, 'dead': -3, 'defeat': -2, 'depressed': -4, 'depression': -4,
  'despair': -4, 'desperate': -3, 'destroy': -3, 'devastated': -4,
  'difficult': -1, 'disappointed': -2, 'disaster': -3, 'distress': -3,
  'drained': -2, 'dread': -3, 'drowning': -3, 'dull': -2, 'dying': -3,
  'empty': -2, 'enemy': -2, 'enraged': -3, 'evil': -3, 'exhausted': -3,
  'fail': -2, 'failed': -2, 'failure': -2, 'fear': -2, 'fed': -1,
  'fight': -1, 'fired': -2, 'fool': -2, 'frantic': -2, 'frustrated': -2,
  'frustrating': -2, 'furious': -3, 'gloomy': -2, 'grief': -3,
  'grim': -2, 'guilt': -3, 'guilty': -3, 'hard': -1, 'hate': -3,
  'hated': -3, 'heartbroken': -3, 'helpless': -2, 'hopeless': -3,
  'horrible': -3, 'hostile': -2, 'hurt': -2, 'inadequate': -2,
  'inferior': -2, 'insecure': -2, 'irritated': -2, 'isolated': -2,
  'jerk': -3, 'kill': -3, 'lazy': -1, 'lonely': -2, 'lose': -2,
  'loser': -3, 'losing': -2, 'loss': -2, 'lost': -2, 'lousy': -2,
  'mad': -2, 'meaningless': -2, 'meltdown': -3, 'mess': -2, 'miserable': -3,
  'misery': -3, 'moody': -1, 'nauseous': -2, 'negative': -2, 'neglect': -2,
  'nervous': -2, 'nightmare': -3, 'numb': -2, 'overwhelmed': -3,
  'pain': -2, 'painful': -2, 'panic': -3, 'pathetic': -2, 'pessimistic': -2,
  'pointless': -2, 'poison': -3, 'poor': -2, 'pressure': -1, 'problem': -2,
  'problems': -2, 'punish': -2, 'rage': -3, 'regret': -2, 'reject': -2,
  'rejected': -2, 'resentful': -2, 'restless': -2, 'ruin': -2, 'ruined': -2,
  'sad': -2, 'sadness': -2, 'scared': -2, 'scream': -2, 'shame': -2,
  'shattered': -3, 'sick': -2, 'sleepless': -2, 'sorrow': -2, 'sorry': -1,
  'stressed': -2, 'struggle': -2, 'struggling': -2, 'stuck': -2, 'stupid': -2,
  'suffer': -2, 'suffering': -2, 'suicidal': -5, 'suicide': -5,
  'tearful': -2, 'terrible': -3, 'terrified': -3, 'tired': -2, 'toxic': -3,
  'tragic': -3, 'trapped': -2, 'trauma': -3, 'ugly': -2, 'unbearable': -3,
  'uncertain': -1, 'unhappy': -2, 'upset': -2, 'useless': -2, 'victim': -3,
  'violated': -3, 'vulnerable': -2, 'waste': -1, 'weak': -2, 'weary': -2,
  'withdrawn': -2, 'worried': -2, 'worse': -2, 'worst': -3, 'worthless': -3,
  'wrecked': -2, 'wrong': -2,

  // Positive (+1 to +5)
  'accomplish': 2, 'accomplished': 2, 'achieve': 2, 'alive': 1, 'amazing': 4,
  'amused': 2, 'appreciate': 2, 'awesome': 4, 'balanced': 2, 'beautiful': 3,
  'best': 3, 'better': 1, 'blessed': 3, 'bliss': 3, 'boost': 1,
  'brave': 2, 'bright': 1, 'brilliant': 4, 'calm': 2, 'capable': 1,
  'care': 2, 'celebrate': 3, 'cheerful': 2, 'clear': 1, 'comfortable': 2,
  'confident': 2, 'content': 2, 'cool': 1, 'courage': 2, 'creative': 2,
  'delight': 3, 'eager': 2, 'easy': 1, 'elegant': 2, 'empowered': 2,
  'encouraged': 2, 'energetic': 2, 'energized': 2, 'enjoy': 2, 'enjoying': 2,
  'enthusiastic': 3, 'excellent': 3, 'excited': 3, 'exciting': 3,
  'faith': 1, 'fantastic': 4, 'fine': 1, 'flourish': 2, 'focused': 2,
  'forgive': 1, 'free': 1, 'fresh': 1, 'friendly': 2, 'fulfilled': 3,
  'fun': 2, 'generous': 2, 'gentle': 2, 'glad': 2, 'good': 2, 'graceful': 2,
  'grateful': 3, 'great': 3, 'grow': 1, 'growth': 2, 'happy': 3,
  'harmony': 2, 'heal': 2, 'healthy': 2, 'heart': 1, 'help': 2,
  'helpful': 2, 'hope': 2, 'hopeful': 2, 'hug': 2, 'humor': 2,
  'impressed': 2, 'improve': 2, 'incredible': 4, 'independent': 2,
  'inspire': 2, 'inspired': 3, 'interesting': 2, 'joy': 3, 'joyful': 3,
  'kind': 2, 'laugh': 2, 'laughing': 2, 'laughter': 2, 'learn': 1,
  'light': 1, 'like': 1, 'love': 3, 'loved': 3, 'lovely': 3, 'luck': 2,
  'lucky': 2, 'meaningful': 2, 'miracle': 4, 'motivated': 2, 'nice': 2,
  'ok': 1, 'okay': 1, 'open': 1, 'optimistic': 2, 'outstanding': 5,
  'paradise': 3, 'passion': 2, 'patient': 2, 'peace': 2, 'peaceful': 2,
  'perfect': 3, 'play': 1, 'pleasant': 2, 'pleased': 2, 'positive': 2,
  'powerful': 2, 'productive': 2, 'progress': 2, 'proud': 2, 'pure': 2,
  'purpose': 2, 'quiet': 1, 'ready': 1, 'recover': 2, 'recovered': 2,
  'refresh': 1, 'relax': 2, 'relaxed': 2, 'relief': 2, 'resilient': 2,
  'resolved': 1, 'rest': 1, 'rested': 2, 'restore': 2, 'reward': 2,
  'safe': 1, 'satisfied': 2, 'secure': 2, 'serene': 2, 'shine': 1,
  'simple': 1, 'smile': 2, 'smooth': 1, 'stable': 1, 'strength': 2,
  'strong': 2, 'succeed': 3, 'success': 3, 'sun': 1, 'sunshine': 2,
  'super': 3, 'support': 2, 'supportive': 2, 'sweet': 2, 'thankful': 2,
  'thrive': 3, 'thriving': 3, 'together': 1, 'top': 1, 'tranquil': 2,
  'triumph': 4, 'trust': 2, 'upbeat': 2, 'uplifted': 2, 'valuable': 2,
  'vibrant': 3, 'victory': 3, 'warm': 1, 'welcome': 2, 'well': 1,
  'win': 3, 'winning': 3, 'wonderful': 4, 'worthy': 2, 'wow': 4,
  'yay': 3, 'yes': 1, 'zen': 2,
};

// ─── Negation handling ───────────────────────────────────────────

const NEGATION_WORDS = new Set([
  'not', "n't", 'no', 'never', 'neither', 'nobody', 'nothing',
  'nowhere', 'nor', 'cannot', "can't", "won't", "wouldn't",
  "shouldn't", "couldn't", "don't", "doesn't", "didn't", "isn't",
  "aren't", "wasn't", "weren't", 'barely', 'hardly', 'scarcely',
]);

// ─── Intensifiers ────────────────────────────────────────────────

const INTENSIFIERS: Record<string, number> = {
  'very': 1.5, 'really': 1.5, 'extremely': 2.0, 'incredibly': 2.0,
  'so': 1.3, 'absolutely': 1.8, 'totally': 1.5, 'completely': 1.8,
  'utterly': 2.0, 'quite': 1.2, 'somewhat': 0.5, 'slightly': 0.3,
  'a bit': 0.5, 'kind of': 0.5, 'sort of': 0.5, 'super': 1.5,
};

// ─── Tokenize ────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s']/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
}

// ─── Analyze Sentiment ───────────────────────────────────────────

export interface SentimentResult {
  score: number;          // raw score (can be negative)
  comparative: number;    // score / word count
  mood_score: number;     // 0-100 normalized (feeds into risk engine)
  positive_words: string[];
  negative_words: string[];
  word_count: number;
}

export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      comparative: 0,
      mood_score: 50,  // neutral
      positive_words: [],
      negative_words: [],
      word_count: 0,
    };
  }

  const tokens = tokenize(text);
  let score = 0;
  const positiveWords: string[] = [];
  const negativeWords: string[] = [];
  let isNegated = false;
  let intensifier = 1.0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];

    // Check for negation
    if (NEGATION_WORDS.has(word)) {
      isNegated = true;
      continue;
    }

    // Check for intensifier
    if (INTENSIFIERS[word]) {
      intensifier = INTENSIFIERS[word];
      continue;
    }

    // Check AFINN lexicon
    if (AFINN[word] !== undefined) {
      let wordScore = AFINN[word] * intensifier;
      if (isNegated) {
        wordScore = -wordScore * 0.75; // negation flips & slightly dampens
      }

      score += wordScore;

      if (wordScore > 0) {
        positiveWords.push(word);
      } else if (wordScore < 0) {
        negativeWords.push(word);
      }
    }

    // Reset modifiers after consuming a scored word
    isNegated = false;
    intensifier = 1.0;
  }

  const comparative = tokens.length > 0 ? score / tokens.length : 0;

  // Convert to 0-100 mood score
  // comparative range is roughly -5 to +5 in extreme cases, typical -1 to +1
  // Map to 0-100 with 50 as neutral
  const moodScore = Math.min(100, Math.max(0,
    50 + (comparative * 25) // ±2 comparative = 0 or 100
  ));

  return {
    score: Math.round(score * 100) / 100,
    comparative: Math.round(comparative * 1000) / 1000,
    mood_score: Math.round(moodScore * 10) / 10,
    positive_words: [...new Set(positiveWords)],
    negative_words: [...new Set(negativeWords)],
    word_count: tokens.length,
  };
}

