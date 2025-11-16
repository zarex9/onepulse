/**
 * Streak narrative configuration for share text generation.
 * Enables easy maintenance, A/B testing, and localization.
 */

export type StreakNarrative = {
  max: number;
  claimed: (streak: number) => string;
  unclaimed: (streak: number) => string;
};

/**
 * Hardcoded streak narratives mapped by maximum days in streak.
 * Each tier maps to a claimed (reward claimed today) and unclaimed (no claim today) variant.
 * Used in `getStreakNarrative()` to determine messaging based on current streak length.
 * Functions receive the current streak value to enable dynamic interpolation.
 */
export const STREAK_NARRATIVES: readonly StreakNarrative[] = [
  {
    max: 0,
    claimed: () => "Just kicked off my streak on OnePulse! 👑",
    unclaimed: () => "About to start my OnePulse journey! 💪",
  },
  {
    max: 1,
    claimed: () => "I just logged my first GM! 🎉",
    unclaimed: () => "I'm one day into my OnePulse streak! 🚀",
  },
  {
    max: 2,
    claimed: (streak) => `I'm on a ${streak}-day streak on OnePulse! 📈`,
    unclaimed: (streak) => `${streak} days of daily GMs and counting! ⚡`,
  },
  {
    max: 6,
    claimed: (streak) => `${streak} days of daily GMs on OnePulse! 🔥`,
    unclaimed: (streak) => `${streak} days in and momentum's building! 💨`,
  },
  {
    max: 13,
    claimed: (streak) => `${streak} days of consistency. That's real. 👑`,
    unclaimed: (streak) => `${streak} days in and still showing up! 💪`,
  },
  {
    max: 29,
    claimed: (streak) => `${streak} days in and I'm just getting started! 🌟`,
    unclaimed: (streak) => `${streak} days in. This habit is taking shape. 🚀`,
  },
  {
    max: 49,
    claimed: (streak) => `${streak} days of showing up. Every single day. ⚡`,
    unclaimed: (streak) => `${streak} days, ${streak} GMs. Dialed in. 💎`,
  },
  {
    max: Number.POSITIVE_INFINITY,
    claimed: (streak) => `${streak} days of habit mastery. 🔥`,
    unclaimed: (streak) =>
      `${streak} days straight. This streak feels unbreakable. 👑`,
  },
] as const;
