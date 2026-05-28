// Recurrence rule calculator — no external dependencies

export interface RecurrenceRule {
  /** Frequency */
  freq: 'DAILY' | 'WEEKLY' | 'BIWEEKLY'
  /**
   * Day(s) of week for WEEKLY/BIWEEKLY runs.
   * Comma-separated, values: MO TU WE TH FR SA SU
   * Example: "MO,WE,FR"
   */
  byday?: string
  /** Multiplier — e.g. interval=2 with WEEKLY = every 2 weeks */
  interval?: number
}

const DAY_OFFSETS: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
}

/**
 * Given a recurrence rule and the last run date, returns the next run date.
 * Times are preserved from `lastRun`.
 */
export function calculateNextRun(rule: RecurrenceRule, lastRun: Date): Date {
  const interval = rule.interval ?? 1
  const next = new Date(lastRun)

  switch (rule.freq) {
    case 'DAILY': {
      next.setDate(next.getDate() + interval)
      return next
    }

    case 'BIWEEKLY': {
      // Treat as WEEKLY with interval * 2
      const effectiveInterval = interval * 2
      if (!rule.byday) {
        next.setDate(next.getDate() + effectiveInterval * 7)
        return next
      }
      return findNextWeekday(next, rule.byday, effectiveInterval)
    }

    case 'WEEKLY': {
      if (!rule.byday) {
        next.setDate(next.getDate() + interval * 7)
        return next
      }
      return findNextWeekday(next, rule.byday, interval)
    }

    default:
      // Fallback: add 7 days
      next.setDate(next.getDate() + 7)
      return next
  }
}

/**
 * Find the next occurrence of any of the specified weekdays,
 * starting the day after `from`, repeating every `weekMultiplier` weeks
 * when the target day has been passed.
 */
function findNextWeekday(from: Date, byday: string, weekMultiplier: number): Date {
  const targetDays = byday
    .split(',')
    .map((d) => DAY_OFFSETS[d.trim().toUpperCase()])
    .filter((d) => d !== undefined)
    .sort((a, b) => a - b)

  if (targetDays.length === 0) {
    const next = new Date(from)
    next.setDate(next.getDate() + weekMultiplier * 7)
    return next
  }

  const currentDay = from.getDay()

  // Find next target day within the same week (strictly after today)
  const nextDayThisWeek = targetDays.find((d) => d > currentDay)
  if (nextDayThisWeek !== undefined) {
    const next = new Date(from)
    next.setDate(next.getDate() + (nextDayThisWeek - currentDay))
    return next
  }

  // No day left this week — jump weekMultiplier weeks and pick first target day
  const firstTargetDay = targetDays[0]
  const daysToMonday = (7 - currentDay) % 7 || 7
  const daysToFirstTarget = daysToMonday + firstTargetDay + (weekMultiplier - 1) * 7

  const next = new Date(from)
  next.setDate(next.getDate() + daysToFirstTarget)
  return next
}
