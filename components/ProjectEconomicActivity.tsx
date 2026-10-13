'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export type MetricSnapshot = {
  id?: string
  project_id?: string
  snapshot_date: string // YYYY-MM-DD
  volume_usd?: number | null
  transaction_count?: number | null
  unique_wallets?: number | null
  data_source?: 'reported' | 'estimated' | 'onchain_verified' | string
  source_note?: string | null
  updated_at?: string | null
  created_at?: string | null
}

type MetricType = 'volume' | 'transactions' | 'users' | 'growth'
type RangeType = '30d' | '90d' | 'all'

const METRIC_OPTIONS: { key: MetricType; label: string; unitType: 'currency' | 'count' | 'percent'; color: string }[] = [
  { key: 'volume', label: 'Transaction Volume', unitType: 'currency', color: '#9945FF' },
  { key: 'transactions', label: 'Number of Transactions', unitType: 'count', color: '#38BDF8' },
  { key: 'users', label: 'Active Users', unitType: 'count', color: '#14F195' },
  { key: 'growth', label: 'Growth Rate', unitType: 'percent', color: '#14F195' },
]

const RANGE_OPTIONS: { key: RangeType; label: string }[] = [
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
  { key: 'all', label: 'All Time' },
]

function formatExactValue(val: number | null | undefined, type: 'currency' | 'count' | 'percent'): string {
  if (val == null) return '—'
  if (type === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(val)
  }
  if (type === 'percent') {
    const sign = val > 0 ? '+' : ''
    return `${sign}${val.toFixed(2)}%`
  }
  return new Intl.NumberFormat('en-US').format(val)
}

function formatLargeValue(val: number | null | undefined, type: 'currency' | 'count' | 'percent'): string {
  if (val == null) return '—'
  if (type === 'currency') {
    if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`
    if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(2)}M`
    if (Math.abs(val) >= 1e3) return `$${(val / 1e3).toFixed(1)}K`
    return `$${val.toLocaleString()}`
  }
  if (type === 'percent') {
    const sign = val > 0 ? '+' : ''
    return `${sign}${val.toFixed(2)}%`
  }
  if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(2)}M`
  if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(1)}K`
  return val.toLocaleString()
}

function formatYAxisTick(val: number, type: 'currency' | 'count' | 'percent'): string {
  if (val === 0) return type === 'currency' ? '$0' : type === 'percent' ? '0%' : '0'
  if (type === 'currency') {
    const abs = Math.abs(val)
    const sign = val < 0 ? '-' : ''
    if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`
    if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
    if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`
    return `${sign}$${abs}`
  }
  if (type === 'percent') {
    const sign = val > 0 ? '+' : ''
    return `${sign}${val.toFixed(0)}%`
  }
  const abs = Math.abs(val)
  const sign = val < 0 ? '-' : ''
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}K`
  return `${sign}${abs}`
}

function formatXAxisDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const d = new Date(year, month, day)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatTooltipDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const d = new Date(year, month, day)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatLastUpdated(updatedAt: string | null | undefined): string {
  if (!updatedAt) return '—'
  try {
    const d = new Date(updatedAt)
    if (isNaN(d.getTime())) return updatedAt
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return updatedAt
  }
}

interface ProjectEconomicActivityProps {
  projectId: string
  initialSnapshots?: MetricSnapshot[]
  className?: string
}

export default function ProjectEconomicActivity({
  projectId,
  initialSnapshots,
  className = '',
}: ProjectEconomicActivityProps) {
  const [snapshots, setSnapshots] = useState<MetricSnapshot[]>(initialSnapshots || [])
  const [metric, setMetric] = useState<MetricType>('volume')
  const [range, setRange] = useState<RangeType>('30d')
  const [loading, setLoading] = useState<boolean>(!initialSnapshots || initialSnapshots.length === 0)
  const [isMounted, setIsMounted] = useState<boolean>(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch snapshots from Supabase if not provided or when projectId changes
  useEffect(() => {
    if (!projectId) return

    let isSubscribed = true
    async function loadSnapshots() {
      try {
        const { data, error } = await supabase
          .from('project_metrics_snapshots')
          .select('*')
          .eq('project_id', projectId)
          .order('snapshot_date', { ascending: true })

        if (error) {
          console.error('[TRÆCERA] Failed to load project metrics snapshots:', error)
        } else if (isSubscribed && data) {
          setSnapshots(data as MetricSnapshot[])
        }
      } catch (err) {
        console.error('[TRÆCERA] Error querying snapshots:', err)
      } finally {
        if (isSubscribed) setLoading(false)
      }
    }

    // Always ensure fresh data from Supabase
    loadSnapshots()

    return () => {
      isSubscribed = false
    }
  }, [projectId])

  const metricConfig = useMemo(() => {
    return METRIC_OPTIONS.find((m) => m.key === metric) || METRIC_OPTIONS[0]
  }, [metric])

  // Filter snapshots according to selected range
  const filteredSnapshots = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return []

    const sorted = [...snapshots].sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date))
    if (range === 'all') return sorted

    const days = range === '30d' ? 30 : 90
    const now = new Date()
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    return sorted.filter((s) => s.snapshot_date >= cutoff)
  }, [snapshots, range])

  // Build chart points
  // RULE 1: Null means missing, never convert null to 0. Show gaps (connectNulls={false}).
  // RULE 2: Never create fake or sample data.
  // RULE 3: Growth Rate is calculated: (latest - first) / first * 100 for selected range.
  const chartData = useMemo(() => {
    if (filteredSnapshots.length === 0) return []

    if (metric !== 'growth') {
      return filteredSnapshots.map((s) => {
        let val: number | null = null
        if (metric === 'volume') {
          val = s.volume_usd != null && !isNaN(Number(s.volume_usd)) ? Number(s.volume_usd) : null
        } else if (metric === 'transactions') {
          val = s.transaction_count != null && !isNaN(Number(s.transaction_count)) ? Number(s.transaction_count) : null
        } else if (metric === 'users') {
          val = s.unique_wallets != null && !isNaN(Number(s.unique_wallets)) ? Number(s.unique_wallets) : null
        }

        return {
          snapshot_date: s.snapshot_date,
          value: val,
          data_source: s.data_source || 'reported',
          source_note: s.source_note,
        }
      })
    }

    // Growth Rate calculation
    // Select base field: volume_usd preferred, then transaction_count, then unique_wallets
    const baseField: 'volume_usd' | 'transaction_count' | 'unique_wallets' =
      filteredSnapshots.some((s) => s.volume_usd != null && Number(s.volume_usd) > 0)
        ? 'volume_usd'
        : filteredSnapshots.some((s) => s.transaction_count != null && Number(s.transaction_count) > 0)
        ? 'transaction_count'
        : 'unique_wallets'

    const validRecords = filteredSnapshots.filter(
      (s) => s[baseField] != null && !isNaN(Number(s[baseField]))
    )

    if (validRecords.length < 2 || Number(validRecords[0][baseField]) <= 0) {
      return []
    }

    const firstVal = Number(validRecords[0][baseField])

    return filteredSnapshots.map((s) => {
      const rawVal = s[baseField]
      let growthVal: number | null = null
      if (rawVal != null && !isNaN(Number(rawVal))) {
        growthVal = Number((((Number(rawVal) - firstVal) / firstVal) * 100).toFixed(2))
      }
      return {
        snapshot_date: s.snapshot_date,
        value: growthVal,
        data_source: s.data_source || 'reported',
        source_note: s.source_note,
      }
    })
  }, [filteredSnapshots, metric])

  // Summary statistics above the chart
  const summary = useMemo(() => {
    if (metric === 'growth') {
      const baseField: 'volume_usd' | 'transaction_count' | 'unique_wallets' =
        filteredSnapshots.some((s) => s.volume_usd != null && Number(s.volume_usd) > 0)
          ? 'volume_usd'
          : filteredSnapshots.some((s) => s.transaction_count != null && Number(s.transaction_count) > 0)
          ? 'transaction_count'
          : 'unique_wallets'

      const validRecords = filteredSnapshots.filter(
        (s) => s[baseField] != null && !isNaN(Number(s[baseField]))
      )

      if (validRecords.length < 2 || Number(validRecords[0][baseField]) <= 0) {
        return {
          largeValue: 'Not enough data yet',
          isNotEnough: true,
          change: null,
          changeNote: null,
        }
      }

      const firstVal = Number(validRecords[0][baseField])
      const latestVal = Number(validRecords[validRecords.length - 1][baseField])
      const growth = ((latestVal - firstVal) / firstVal) * 100
      const sign = growth > 0 ? '+' : ''

      return {
        largeValue: `${sign}${growth.toFixed(2)}%`,
        isNotEnough: false,
        change: {
          percent: growth,
          isPositive: growth >= 0,
          formatted: `${sign}${growth.toFixed(2)}%`,
        },
        changeNote: null,
      }
    }

    const validRecords = chartData.filter((d) => d.value != null)
    if (validRecords.length === 0) {
      return {
        largeValue: '—',
        isNotEnough: false,
        change: null,
        changeNote: null,
      }
    }

    const latestVal = validRecords[validRecords.length - 1].value!
    const firstVal = validRecords[0].value!

    let change: { percent: number; isPositive: boolean; formatted: string } | null = null
    let changeNote: string | null = null

    if (validRecords.length >= 2 && firstVal > 0) {
      const changePct = ((latestVal - firstVal) / firstVal) * 100
      const sign = changePct > 0 ? '+' : ''
      change = {
        percent: changePct,
        isPositive: changePct >= 0,
        formatted: `${sign}${changePct.toFixed(2)}%`,
      }
    } else {
      changeNote = 'Not enough data yet'
    }

    return {
      largeValue: formatLargeValue(latestVal, metricConfig.unitType),
      isNotEnough: false,
      change,
      changeNote,
    }
  }, [metric, filteredSnapshots, chartData, metricConfig])

  // Find latest updated_at or created_at across all snapshots
  const latestUpdatedAt = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return null
    let latestTimestamp: string | null = null
    for (const s of snapshots) {
      const candidate = s.updated_at || s.created_at || s.snapshot_date
      if (!candidate) continue
      if (!latestTimestamp || new Date(candidate).getTime() > new Date(latestTimestamp).getTime()) {
        latestTimestamp = candidate
      }
    }
    return latestTimestamp
  }, [snapshots])

  const hasDataForMetric = useMemo(() => {
    if (metric === 'growth') {
      return chartData.length > 0 && chartData.some((d) => d.value != null)
    }
    return chartData.some((d) => d.value != null)
  }, [chartData, metric])

  // Custom Dot component: hollow for reported & estimated, solid for onchain_verified
  const CustomDot = (dotProps: any) => {
    const { cx, cy, payload } = dotProps
    if (cx == null || cy == null || payload?.value == null) return null
    const isVerified = payload.data_source === 'onchain_verified'
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4.5}
        stroke={metricConfig.color}
        strokeWidth={2}
        fill={isVerified ? metricConfig.color : '#0a0a0f'}
      />
    )
  }

  const CustomActiveDot = (dotProps: any) => {
    const { cx, cy, payload } = dotProps
    if (cx == null || cy == null || payload?.value == null) return null
    const isVerified = payload.data_source === 'onchain_verified'
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6.5}
        stroke={metricConfig.color}
        strokeWidth={2.5}
        fill={isVerified ? metricConfig.color : '#0a0a0f'}
      />
    )
  }

  const rangeLabel = useMemo(() => {
    return RANGE_OPTIONS.find((r) => r.key === range)?.label || 'Selected Period'
  }, [range])

  return (
    <section className={`rounded-2xl border border-white/5 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-xl ${className}`}>
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Economic Activity</h2>
          </div>
          <p className="text-xs text-zinc-400">Historical performance metrics and verified network growth</p>
        </div>

        {/* Legend for dots */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: metricConfig.color }}
            />
            <span className="text-zinc-300">On-chain Verified (Solid)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full border-2 bg-transparent"
              style={{ borderColor: metricConfig.color }}
            />
            <span className="text-zinc-400">Reported / Estimated (Hollow)</span>
          </div>
        </div>
      </div>

      {/* Controls: Metric selector & Range selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        {/* Metric selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-950/80 rounded-xl border border-white/5">
          {METRIC_OPTIONS.map((opt) => {
            const isActive = metric === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setMetric(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1 p-1 bg-zinc-950/80 rounded-xl border border-white/5 self-start lg:self-auto">
          {RANGE_OPTIONS.map((opt) => {
            const isActive = range === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setRange(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/15'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Metric summary numbers above chart */}
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
          {metricConfig.label}
        </div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className={`font-bold font-mono tracking-tight text-white ${summary.isNotEnough ? 'text-xl sm:text-2xl text-zinc-400' : 'text-3xl sm:text-4xl'}`}>
            {summary.largeValue}
          </span>

          {summary.change && (
            <span className={`inline-flex items-center gap-1 text-sm font-semibold font-mono ${summary.change.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {summary.change.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {summary.change.formatted}
              <span className="text-xs text-zinc-500 font-normal">({rangeLabel})</span>
            </span>
          )}

          {summary.changeNote && (
            <span className="text-xs text-zinc-500 font-mono italic">
              {summary.changeNote}
            </span>
          )}
        </div>
      </div>

      {/* Chart Canvas or Empty State */}
      <div className="h-[360px] w-full relative">
        {loading ? (
          <div className="h-full w-full rounded-xl border border-white/5 bg-zinc-950/40 flex items-center justify-center text-zinc-500 text-sm">
            Loading activity data...
          </div>
        ) : !hasDataForMetric ? (
          /* Empty state - RULE 4 */
          <div className="h-full w-full rounded-xl border border-white/5 bg-zinc-950/40 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 bg-white/5 rounded-2xl mb-4 text-zinc-500">
              <Activity className="h-8 w-8 text-zinc-600" />
            </div>
            <p className="text-sm md:text-base text-zinc-400 max-w-md font-medium">
              No activity records yet. Add your first record to begin tracking project growth.
            </p>
          </div>
        ) : isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

              <XAxis
                dataKey="snapshot_date"
                stroke="#71717A"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                padding={{ left: 16, right: 16 }}
                tickFormatter={formatXAxisDate}
              />

              <YAxis
                domain={['auto', 'auto']}
                stroke="#71717A"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatYAxisTick(val, metricConfig.unitType)}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  const data = payload[0].payload
                  if (!data || data.value === null || data.value === undefined) return null

                  const sourceLabels: Record<string, { text: string; color: string; bg: string }> = {
                    onchain_verified: {
                      text: 'On-chain Verified',
                      color: 'text-emerald-400',
                      bg: 'bg-emerald-400/10 border-emerald-400/20',
                    },
                    reported: {
                      text: 'Reported',
                      color: 'text-yellow-400',
                      bg: 'bg-yellow-400/10 border-yellow-400/20',
                    },
                    estimated: {
                      text: 'Estimated',
                      color: 'text-zinc-400',
                      bg: 'bg-zinc-400/10 border-zinc-400/20',
                    },
                  }

                  const source = sourceLabels[data.data_source] || {
                    text: data.data_source || 'Reported',
                    color: 'text-zinc-400',
                    bg: 'bg-zinc-400/10 border-zinc-400/20',
                  }

                  return (
                    <div className="rounded-xl border border-white/10 bg-[#0d0d14]/95 p-3.5 shadow-2xl backdrop-blur-md text-xs min-w-[200px]">
                      <div className="text-zinc-400 mb-1.5 font-medium">{formatTooltipDate(data.snapshot_date)}</div>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-zinc-300">{metricConfig.label}:</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {formatExactValue(data.value, metricConfig.unitType)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-zinc-500">Source:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${source.bg} ${source.color}`}>
                          {source.text}
                        </span>
                      </div>
                      {data.source_note && (
                        <div className="mt-1.5 text-[10px] text-zinc-500 italic max-w-[220px] break-words">
                          Note: {data.source_note}
                        </div>
                      )}
                    </div>
                  )
                }}
              />

              {/* Area with line: connectNulls=false to show gaps for missing/null data */}
              <Area
                type="monotone"
                dataKey="value"
                stroke={metricConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#grad-${metric})`}
                connectNulls={false}
                dot={<CustomDot />}
                activeDot={<CustomActiveDot />}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>

      {/* Footer info: Last updated and TRÆCERA disclaimer */}
      <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-zinc-500">
        <div>
          Last updated: <span className="text-zinc-400">{formatLastUpdated(latestUpdatedAt)}</span>
        </div>
        <p className="italic">
          Reported figures come from the project and are not verified by TRÆCERA.
        </p>
      </div>
    </section>
  )
}
