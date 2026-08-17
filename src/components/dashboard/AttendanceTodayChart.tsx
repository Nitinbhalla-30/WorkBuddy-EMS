import React, { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlarmClock, Plane, UserCheck, Users, UserX } from 'lucide-react'
import { DonutChart } from '@/components/ui/donut-chart'
import { cn } from '@/lib/utils'

export type AttendanceChartKey = 'ontime' | 'late' | 'absent'

const CHART_BUCKETS = [
  { key: 'ontime' as const, label: 'On time' },
  { key: 'late' as const, label: 'Late' },
  { key: 'absent' as const, label: 'Absent' }
]

const STATUS_COLORS: Record<AttendanceChartKey, string> = {
  ontime: 'var(--good)',
  late: 'var(--warn)',
  absent: 'var(--bad)'
}

interface AttendanceTodayChartProps {
  employees: number
  present: number
  late: number
  absent: number
  onLeave?: number
}

export function AttendanceTodayChart({
  employees,
  present,
  late,
  absent,
  onLeave = 0
}: AttendanceTodayChartProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const onTime = Math.max(0, present - late)

  const data = useMemo(
    () =>
      CHART_BUCKETS.map((bucket) => ({
        key: bucket.key,
        label: bucket.label,
        value:
          bucket.key === 'ontime'
            ? onTime
            : bucket.key === 'late'
              ? late
              : absent,
        color: STATUS_COLORS[bucket.key]
      })),
    [onTime, late, absent]
  )

  const total = employees
  const active = data.find((d) => d.label === hovered)

  const handleSegmentHover = useCallback((segment: { label: string } | null) => {
    setHovered(segment?.label ?? null)
  }, [])

  return (
    <div className="dashboard-attendance-overview">
      <div className="dashboard-attendance-stat-grid">
        <div
          className={cn(
            'stat-card task-status-stat-card',
            hovered === 'Employees' && 'task-status-stat-card-active'
          )}
          onMouseEnter={() => setHovered('Employees')}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="stat-chip"><Users size={18} aria-hidden="true" /></span>
          <div className="stat-num">{employees}</div>
          <div className="stat-label">Employees</div>
        </div>

        {data.map((segment) => (
          <div
            key={segment.key}
            className={cn(
              'stat-card task-status-stat-card',
              segment.key === 'ontime' && 'stat-good',
              segment.key === 'late' && 'stat-warn',
              segment.key === 'absent' && 'stat-bad',
              hovered === segment.label && 'task-status-stat-card-active'
            )}
            onMouseEnter={() => setHovered(segment.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="stat-chip">
              {segment.key === 'ontime' && <UserCheck size={18} aria-hidden="true" />}
              {segment.key === 'late' && <AlarmClock size={18} aria-hidden="true" />}
              {segment.key === 'absent' && <UserX size={18} aria-hidden="true" />}
            </span>
            <div className="stat-num">{segment.value}</div>
            <div className="stat-label">{segment.label}</div>
          </div>
        ))}

        <div className="stat-card task-status-stat-card">
          <span className="stat-chip"><Plane size={18} aria-hidden="true" /></span>
          <div className="stat-num">{onLeave}</div>
          <div className="stat-label">On leave</div>
        </div>
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
                key={
                  hovered === 'Employees'
                    ? 'employees'
                    : active?.label ?? (total === 0 ? 'empty' : 'total')
                }
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="task-status-chart-center"
              >
                <p className="muted small task-status-chart-center-label">
                  {total === 0
                    ? 'No employees'
                    : hovered === 'Employees'
                      ? 'Employees'
                      : active?.label ?? 'Employees'}
                </p>
                <p className="task-status-chart-center-value">
                  {hovered === 'Employees'
                    ? total
                    : active?.value ?? total}
                </p>
              </motion.div>
            </AnimatePresence>
          }
        />
      </div>
    </div>
  )
}
