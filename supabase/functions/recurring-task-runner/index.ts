import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Recurrence helpers ───────────────────────────────────────────────────────

interface RecurrenceRule {
  freq: 'DAILY' | 'WEEKLY' | 'BIWEEKLY'
  byday?: string
  interval?: number
}

const DAY_OFFSETS: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
}

function findNextWeekday(from: Date, byday: string, weekMultiplier: number): Date {
  const targetDays = byday
    .split(',')
    .map((d) => DAY_OFFSETS[d.trim().toUpperCase()])
    .filter((d) => d !== undefined)
    .sort((a: number, b: number) => a - b)

  if (targetDays.length === 0) {
    const next = new Date(from)
    next.setDate(next.getDate() + weekMultiplier * 7)
    return next
  }

  const currentDay = from.getDay()
  const nextDayThisWeek = targetDays.find((d: number) => d > currentDay)

  if (nextDayThisWeek !== undefined) {
    const next = new Date(from)
    next.setDate(next.getDate() + (nextDayThisWeek - currentDay))
    return next
  }

  const firstTargetDay = targetDays[0]
  const daysToMonday = (7 - currentDay) % 7 || 7
  const daysToFirstTarget = daysToMonday + firstTargetDay + (weekMultiplier - 1) * 7

  const next = new Date(from)
  next.setDate(next.getDate() + daysToFirstTarget)
  return next
}

function calculateNextRun(rule: RecurrenceRule, lastRun: Date): Date {
  const interval = rule.interval ?? 1
  const next = new Date(lastRun)

  switch (rule.freq) {
    case 'DAILY':
      next.setDate(next.getDate() + interval)
      return next

    case 'BIWEEKLY':
      if (!rule.byday) {
        next.setDate(next.getDate() + interval * 2 * 7)
        return next
      }
      return findNextWeekday(next, rule.byday, interval * 2)

    case 'WEEKLY':
    default:
      if (!rule.byday) {
        next.setDate(next.getDate() + interval * 7)
        return next
      }
      return findNextWeekday(next, rule.byday, interval)
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

serve(async (req) => {
  try {
    const supabaseUrl    = Deno.env.get('SUPABASE_URL')!
    const supabaseKey    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase       = createClient(supabaseUrl, supabaseKey)

    const now = new Date()

    // Find active recurring_task instances whose next_run_at has passed
    const { data: instances, error: fetchError } = await supabase
      .from('timeline_instances')
      .select('id, recurrence_rule, run_count, steps')
      .eq('tipo', 'recurring_task')
      .eq('status', 'active')
      .lte('next_run_at', now.toISOString())

    if (fetchError) throw fetchError

    if (!instances || instances.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let processed = 0
    const errors: string[] = []

    for (const instance of instances) {
      try {
        // Determine first step id from the steps array
        let firstStepId: string | null = null
        if (Array.isArray(instance.steps) && instance.steps.length > 0) {
          const sorted = [...instance.steps].sort((a: { ordem?: number }, b: { ordem?: number }) =>
            (a.ordem ?? 0) - (b.ordem ?? 0)
          )
          firstStepId = sorted[0]?.id ?? null
        }

        // Calculate next run
        const rule = instance.recurrence_rule as RecurrenceRule | null
        const nextRun = rule
          ? calculateNextRun(rule, now)
          : (() => {
              const d = new Date(now)
              d.setDate(d.getDate() + 7)
              return d
            })()

        const updatePayload: Record<string, unknown> = {
          completed_steps: [],
          run_count:       (instance.run_count ?? 0) + 1,
          next_run_at:     nextRun.toISOString(),
          updated_at:      now.toISOString(),
        }

        if (firstStepId) {
          updatePayload.current_step_id = firstStepId
        }

        const { error: updateError } = await supabase
          .from('timeline_instances')
          .update(updatePayload)
          .eq('id', instance.id)

        if (updateError) throw updateError

        processed++
      } catch (err) {
        errors.push(`instance ${instance.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    const body = { processed, total: instances.length, errors: errors.length > 0 ? errors : undefined }

    return new Response(JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('recurring-task-runner error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
