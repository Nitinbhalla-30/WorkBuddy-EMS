import React, { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarX2, CircleCheck, Hourglass, ListTodo } from 'lucide-react'
import { DonutChart } from '@/components/ui/donut-chart'
import { TASK_CHART_BUCKETS, chartBucketKey, isOverdue, quickFilterBucketKey } from '@/utils/tasks.js'
import { cn } from '@/lib/utils'

export type TaskStatusKey = 'todo' | 'inprogress' | 'done'

export interface TaskForChart {
  status: string
  dueDate?: string
  createdById?: string
  assigneeId?: string
}

const STATUS_COLORS: Record<TaskStatusKey, string> = {
  todo: 'var(--accent-blue)',
  inprogress: 'var(--warn)',
  done: 'var(--good)'
}

export function TaskStatusChart({
  tasks,
  activeKey = null,
  onToggleKey
}: {
  tasks: TaskForChart[]
  activeKey?: string | null
  onToggleKey?: (key: string) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  const data = useMemo(() => {
    const counts: Record<TaskStatusKey, number> = {
      todo: 0,
      inprogress: 0,
      done: 0
    }
    for (const t of tasks) {
      // Use actual status for stat card counts, not chart visualization logic.
      // This ensures stat cards update correctly when employee changes status.
      const bucket = quickFilterBucketKey(t) as TaskStatusKey
      counts[bucket] += 1
    }
    return TASK_CHART_BUCKETS.map((bucket) => ({
      key: bucket.key as TaskStatusKey,
      label: bucket.label,
      value: counts[bucket.key as TaskStatusKey],
      color: STATUS_COLORS[bucket.key as TaskStatusKey]
    }))
  }, [tasks])

  const total = tasks.length
  const overdueCount = useMemo(
    () => tasks.filter((t) => isOverdue(t)).length,
    [tasks]
  )
  const active = data.find((d) => d.label === hovered)
  const clicked = activeKey && activeKey !== 'all' && activeKey !== 'overdue'
    ? data.find((d) => d.key === activeKey)
    : null
  const clickedOverdue = activeKey === 'overdue'
  const displayed = active || (clickedOverdue ? { label: 'Overdue', value: overdueCount } : clicked)
  const pct = total > 0 && displayed ? Math.round((displayed.value / total) * 100) : 0

  const handleSegmentHover = useCallback((segment: { label: string } | null) => {
    setHovered(segment?.label ?? null)
  }, [])

  return (
    <div className="task-status-overview">
      <div className="stat-grid task-status-stat-grid">
        <button
          type="button"
          className={cn(
            'stat-card task-status-stat-card stat-neutral',
            hovered === 'Total' && 'task-status-stat-card-active'
          )}
          aria-pressed={false}
          onClick={() => onToggleKey?.('all')}
          onMouseEnter={() => setHovered('Total')}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="stat-chip">
            <ListTodo size={18} aria-hidden="true" />
          </span>
          <div className="stat-num">{total}</div>
          <div className="stat-label">
            <span>Total Tasks</span>
            <span className="stat-label-pct">100%</span>
          </div>
        </button>

        {data.map((segment) => (
          <button
            type="button"
            key={segment.key}
            className={cn(
              'stat-card task-status-stat-card',
              segment.key === 'todo' && 'stat-info',
              segment.key === 'done' && 'stat-good',
              segment.key === 'inprogress' && 'stat-warn',
              (hovered === segment.label || activeKey === segment.key) && 'task-status-stat-card-active'
            )}
            aria-pressed={activeKey === segment.key}
            onClick={() => onToggleKey?.(segment.key)}
            onMouseEnter={() => setHovered(segment.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="stat-chip">
              {segment.key === 'todo' && <ListTodo size={18} aria-hidden="true" />}
              {segment.key === 'inprogress' && <Hourglass size={18} aria-hidden="true" />}
              {segment.key === 'done' && <CircleCheck size={18} aria-hidden="true" />}
            </span>
            <div className="stat-num">{segment.value}</div>
            <div className="stat-label">
              <span>{segment.label}</span>
              <span className="stat-label-pct">{total > 0 ? Math.round((segment.value / total) * 100) : 0}%</span>
            </div>
          </button>
        ))}
        <button
          type="button"
          className={cn(
            'stat-card task-status-stat-card stat-bad',
            (hovered === 'Overdue' || activeKey === 'overdue') && 'task-status-stat-card-active'
          )}
          aria-pressed={activeKey === 'overdue'}
          onClick={() => onToggleKey?.('overdue')}
          onMouseEnter={() => setHovered('Overdue')}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="stat-chip">
            <CalendarX2 size={18} aria-hidden="true" />
          </span>
          <div className="stat-num">{overdueCount}</div>
          <div className="stat-label">
            <span>Overdue</span>
            <span className="stat-label-pct">{total > 0 ? Math.round((overdueCount / total) * 100) : 0}%</span>
          </div>
        </button>
      </div>

      <div
        className="task-status-donut-wrap"
        onMouseLeave={() => setHovered(null)}
      >
        <DonutChart
          data={data}
          size={120}
          strokeWidth={16}
          onSegmentHover={handleSegmentHover}
          onSegmentClick={(seg) => onToggleKey?.(seg.key)}
          centerContent={
            <AnimatePresence mode="wait">
              <motion.div
                key={displayed ? displayed.label : (hovered === 'Total' ? 'total-hover' : 'total')}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: hovered ? 0.15 : 0.2 }}
                className="task-status-chart-center"
              >
                <p className="muted small task-status-chart-center-label">
                  {total === 0
                    ? 'No tasks yet'
                    : displayed
                      ? displayed.label
                      : 'Total Tasks'}
                </p>
                <p className="task-status-chart-center-value">
                  {total === 0
                    ? '0'
                    : displayed
                      ? `${pct}%`
                      : total}
                </p>
              </motion.div>
            </AnimatePresence>
          }
        />
      </div>
    </div>
  )
}
