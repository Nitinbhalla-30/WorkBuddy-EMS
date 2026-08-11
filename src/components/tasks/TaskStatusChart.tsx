import React, { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DonutChart } from '@/components/ui/donut-chart'
import { TASK_CHART_BUCKETS, chartBucketKey } from '@/utils/tasks.js'
import { cn } from '@/lib/utils'

export type TaskStatusKey = 'todo' | 'inprogress' | 'done'

export interface TaskForChart {
  status: string
}

const STATUS_COLORS: Record<TaskStatusKey, string> = {
  todo: 'var(--brand)',
  inprogress: 'var(--warn)',
  done: 'var(--good)'
}

export function TaskStatusChart({ tasks }: { tasks: TaskForChart[] }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const data = useMemo(() => {
    const counts: Record<TaskStatusKey, number> = {
      todo: 0,
      inprogress: 0,
      done: 0
    }
    for (const t of tasks) {
      const bucket = chartBucketKey(t) as TaskStatusKey
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
  const active = data.find((d) => d.label === hovered)

  const handleSegmentHover = useCallback((segment: { label: string } | null) => {
    setHovered(segment?.label ?? null)
  }, [])

  return (
    <div className="task-status-overview">
      <div className="stat-grid task-status-stat-grid">
        {data.map((segment) => (
          <div
            key={segment.key}
            className={cn(
              'stat-card task-status-stat-card',
              segment.key === 'done' && 'stat-good',
              hovered === segment.label && 'task-status-stat-card-active'
            )}
            onMouseEnter={() => setHovered(segment.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="stat-num">{segment.value}</div>
            <div className="stat-label">{segment.label}</div>
          </div>
        ))}
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
          centerContent={
            <AnimatePresence mode="wait">
              <motion.div
                key={active?.label ?? (total === 0 ? 'empty' : 'total')}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="task-status-chart-center"
              >
                <p className="muted small task-status-chart-center-label">
                  {total === 0
                    ? 'No tasks yet'
                    : active?.label ?? 'Total Tasks'}
                </p>
                <p className="task-status-chart-center-value">
                  {active?.value ?? total}
                </p>
              </motion.div>
            </AnimatePresence>
          }
        />
      </div>
    </div>
  )
}
