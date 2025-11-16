/**
 * Streak narrative configuration for share text generation.
 * Enables easy maintenance, A/B testing, and localization.
 */

export type StreakNarrative = {
  max: number;
  claimed: (streak: number) => string;
  unclaimed: (streak: number) => string;
};

export type SpecialMilestone = {
  streak: number;
  totalGMs?: number;
  claimed: string;
  unclaimed: string;
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

/**
 * Special milestone messages that take precedence over generic narratives.
 * Matched by streak and optionally by totalGMs for first-claim celebrations.
 * Enables easy addition/removal of milestone celebrations without changing component logic.
 */
export const SPECIAL_MILESTONES: readonly SpecialMilestone[] = [
  {
    streak: 1,
    totalGMs: 1,
    claimed:
      "🎉 Just claimed my very first reward!\n\nClaim yours on OnePulse and start your streak 🚀",
    unclaimed: "🌟 I just logged my first GM!\n\nJoin me on OnePulse 💪",
  },
  {
    streak: 7,
    claimed:
      "🎊 One week of daily claims on OnePulse!\n\nThis streak is just getting started. 💰",
    unclaimed:
      "⚡ One week on OnePulse!\n\nThis streak is building for real. 🔥",
  },
  {
    streak: 30,
    claimed: "👑 A full month on OnePulse!\n\nThis habit is locked in. 💎",
    unclaimed:
      "🏆 Thirty days on OnePulse!\n\nThis streak feels unbreakable now. 🚀",
  },
] as const;

/**
 * Lookup a special milestone by streak and optional totalGMs.
 * Returns the matching milestone or undefined if no match found.
 * Milestones with totalGMs are matched first (more specific), then by streak alone.
 */
export function getSpecialMilestone(
  streak: number,
  totalGMs: number
): SpecialMilestone | undefined {
  // First, try exact match (streak + totalGMs)
  const exactMatch = SPECIAL_MILESTONES.find(
    (m) => m.streak === streak && m.totalGMs === totalGMs
  );
  if (exactMatch) {
    return exactMatch;
  }

  // Then, try streak-only match (for milestones without totalGMs constraint)
  return SPECIAL_MILESTONES.find((m) => m.streak === streak && !m.totalGMs);
}
