import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const PULL_OUT_PX = 2

export interface DonutChartSegment {
  value: number
  color: string
  label: string
  [key: string]: unknown
}

interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DonutChartSegment[]
  totalValue?: number
  size?: number
  strokeWidth?: number
  animationDuration?: number
  animationDelayPerSegment?: number
  highlightOnHover?: boolean
  centerContent?: React.ReactNode
  onSegmentHover?: (segment: DonutChartSegment | null) => void
  onSegmentClick?: (segment: DonutChartSegment) => void
  externalHoveredLabel?: string | null
  activeSegmentKey?: string | null
}

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      data,
      totalValue: propTotalValue,
      size = 200,
      strokeWidth = 20,
      animationDuration = 1,
      animationDelayPerSegment = 0.05,
      highlightOnHover = true,
      centerContent,
      onSegmentHover,
      onSegmentClick,
      externalHoveredLabel,
      activeSegmentKey,
      className,
      ...props
    },
    ref
  ) => {
    const [hoveredSegment, setHoveredSegment] =
      React.useState<DonutChartSegment | null>(null)

    const [reducedMotion, setReducedMotion] = React.useState(false)
    React.useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReducedMotion(mq.matches)
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }, [])

    const internalTotalValue = React.useMemo(
      () =>
        propTotalValue ?? data.reduce((sum, segment) => sum + segment.value, 0),
      [data, propTotalValue]
    )

    const radius = size / 2 - strokeWidth / 2
    const circumference = 2 * Math.PI * radius
    const innerHoleDiameter = Math.max(0, (radius - strokeWidth / 2) * 2)

    React.useEffect(() => {
      onSegmentHover?.(hoveredSegment)
    }, [hoveredSegment, onSegmentHover])

    const clearHover = () => {
      setHoveredSegment(null)
    }

    let cumulativePercentage = 0

    return (
      <div
        ref={ref}
        className={cn('donut-chart', className)}
        style={{ width: size, height: size }}
        onMouseLeave={clearHover}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="donut-chart-svg"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--line)"
            strokeWidth={strokeWidth}
            opacity={0.55}
          />

          <AnimatePresence>
            {data.map((segment, index) => {
              if (segment.value === 0) return null

              const percentage =
                internalTotalValue === 0
                  ? 0
                  : (segment.value / internalTotalValue) * 100

              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = (cumulativePercentage / 100) * circumference

              const isActive = hoveredSegment?.label === segment.label || externalHoveredLabel === segment.label || activeSegmentKey === segment.key
              const isDimmed = (hoveredSegment !== null || externalHoveredLabel != null || (activeSegmentKey != null && activeSegmentKey !== 'all')) && !isActive

              // Pull-out offset along the segment's radial midpoint
              const midAngle = ((cumulativePercentage + percentage / 2) / 100) * 2 * Math.PI
              const pullOut = isActive && !reducedMotion ? PULL_OUT_PX : 0
              const dx = pullOut * Math.cos(midAngle)
              const dy = pullOut * Math.sin(midAngle)

              cumulativePercentage += percentage

              return (
                <motion.circle
                  key={segment.label || index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={-strokeDashoffset}
                  strokeLinecap="round"
                  initial={{ opacity: 0, strokeDashoffset: circumference }}
                  animate={{
                    opacity: isDimmed ? 0.4 : 1,
                    strokeDashoffset: -strokeDashoffset,
                    x: dx,
                    y: dy
                  }}
                  transition={{
                    opacity: { duration: 0.3, delay: index * animationDelayPerSegment },
                    strokeDashoffset: {
                      duration: animationDuration,
                      delay: index * animationDelayPerSegment,
                      ease: 'easeOut'
                    },
                    x: { duration: 0.2, ease: 'easeOut' },
                    y: { duration: 0.2, ease: 'easeOut' }
                  }}
                  className={cn(
                    'donut-chart-segment',
                    highlightOnHover && 'donut-chart-segment-interactive'
                  )}
                  style={{
                    filter: isActive
                      ? `drop-shadow(0px 0px 6px ${segment.color}) brightness(1.1)`
                      : 'none'
                  }}
                  onMouseEnter={() => setHoveredSegment(segment)}
                  onClick={() => onSegmentClick?.(segment)}
                />
              )
            })}
          </AnimatePresence>
        </svg>

        {centerContent && (
          <div
            className="donut-chart-center"
            style={{
              width: innerHoleDiameter,
              height: innerHoleDiameter
            }}
            onMouseEnter={clearHover}
          >
            {centerContent}
          </div>
        )}
      </div>
    )
  }
)

DonutChart.displayName = 'DonutChart'

export { DonutChart }
