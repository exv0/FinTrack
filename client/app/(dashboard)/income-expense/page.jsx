'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { transactionsApi } from '@/lib/api'
import { useLocale } from '@/context/LocaleContext'
import StatCard from '@/components/dashboard/StatCard'
import MonthlyBarChart from '@/components/income-expense/MonthlyBarChart'
import SplitComparison from '@/components/income-expense/SplitComparison'
import styles from './income-expense.module.css'

const PERIODS = ['Last 5 months', 'This year']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getHealthStatus(pct) {
  if (pct < 70) return { label: 'Healthy',   emoji: '🟢', color: 'var(--success)', bg: 'var(--success-light)' }
  if (pct < 90) return { label: 'Watch out', emoji: '🟡', color: 'var(--warning)', bg: 'var(--warning-light)' }
  return            { label: 'Over limit', emoji: '🔴', color: 'var(--danger)',  bg: 'var(--danger-light)' }
}

// Transforms the aggregation pipeline output into a clean per-month income/expense array
function buildMonthlyData(trendRaw, monthsBack) {
  const now = new Date()
  const months = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: MONTH_NAMES[d.getMonth()] })
  }

  return months.map(({ year, month, label }) => {
    const incomeEntry  = trendRaw.find(t => t._id.year === year && t._id.month === month && t._id.type === 'income')
    const expenseEntry = trendRaw.find(t => t._id.year === year && t._id.month === month && t._id.type === 'expense')
    return {
      month: label,
      income: incomeEntry?.total || 0,
      expense: expenseEntry?.total || 0,
    }
  })
}

export default function IncomeExpensePage() {
  const { money } = useLocale()
  const [period, setPeriod] = useState('Last 5 months')
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const monthsBack = period === 'This year' ? 12 : 5
        const { data } = await transactionsApi.monthlyTrend({ months: monthsBack })
        setMonthlyData(buildMonthlyData(data, monthsBack))
      } catch {
        setError('Could not load income vs expense data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  const { totalIncome, totalExpenses, netBalance, spentPct } = useMemo(() => {
    const current = monthlyData[monthlyData.length - 1] || { income: 0, expense: 0 }
    const totalIncome   = current.income
    const totalExpenses  = current.expense
    const netBalance     = totalIncome - totalExpenses
    const spentPct       = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0
    return { totalIncome, totalExpenses, netBalance, spentPct }
  }, [monthlyData])

  const health = getHealthStatus(spentPct)
  const savingsPct = Math.max(100 - spentPct, 0)

  // Approximate split — without category-level "needs vs wants" tagging this is
  // a simplified heuristic; swap for real tagged data once categories carry a type field
  const actualSplit = {
    needs: Math.min(Math.round(spentPct * 0.65), 100),
    wants: Math.min(Math.round(spentPct * 0.35), 100),
    savings: savingsPct,
  }

  return (
    <div className="fade-up">
      {/* Top row */}
      <div className={styles.topRow}>
        <div className={styles.pillGroup}>
          {PERIODS.map(p => (
            <button
              key={p}
              className={`${styles.pill} ${period === p ? styles.pillActive : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <button className={styles.ghostBtn}>
          <Plus size={14} /> Add income
        </button>
      </div>

      {loading ? (
        <p className={styles.loadingText}>Loading…</p>
      ) : error ? (
        <p className={styles.errorText}>{error}</p>
      ) : (
        <>
          {/* Row 1 — 3 stat cards */}
          <div className={styles.statRow}>
            <StatCard label="Total income" value={money(totalIncome)} subLabel="This month" />
            <StatCard label="Total expenses" value={money(totalExpenses)} subLabel="This month" />
            <div className={styles.netCard}>
              <span className={styles.netLabel}>Net balance</span>
              <span className={styles.netValue}>
                {netBalance >= 0 ? '+' : ''}{money(netBalance)}
              </span>
              <span className={styles.healthBadge} style={{ color: health.color, background: health.bg }}>
                {health.emoji} {health.label}
              </span>
            </div>
          </div>

          {/* Row 2 — 2 columns */}
          <div className={styles.row2}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Monthly comparison</h2>
              {monthlyData.length === 0 ? (
                <p className={styles.emptyText}>Not enough data yet to show a trend.</p>
              ) : (
                <MonthlyBarChart data={monthlyData} />
              )}
            </div>

            <div className={styles.rightCol}>
              <div className={styles.card}>
                <span className={styles.smallLabel}>Net balance this month</span>
                <span className={styles.bigNumber} style={{ color: netBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {netBalance >= 0 ? '+' : ''}{money(netBalance)}
                </span>
                <span className={styles.savingsNote}>
                  You&apos;re saving {savingsPct}% of income
                </span>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitleSm}>Your split vs 50/30/20 target</h3>
                <SplitComparison actual={actualSplit} />
              </div>

              {spentPct >= 60 && (
                <div className={styles.fixCard}>
                  <span className={styles.fixTitle}>🔧 Fix it</span>
                  <p className={styles.fixBody}>
                    You&apos;ve spent {spentPct}% of your income — review your biggest category to find savings.
                  </p>
                  <button className={styles.fixBtn}>Review budget →</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}