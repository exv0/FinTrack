'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { budgetsApi, goalsApi, transactionsApi } from '@/lib/api'
import NotificationItem from '@/components/notifications/NotificationItem'
import styles from './notifications.module.css'

const TABS = ['All', 'Alerts', 'Summaries', 'Tips']
const DISMISSED_KEY = 'fintrack_dismissed_notifications'

function getDismissed() {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]') } catch { return [] }
}
function setDismissed(ids) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids))
}

export default function NotificationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('All')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [dismissedIds, setDismissedIds] = useState([])

  useEffect(() => {
    setDismissedIds(getDismissed())

    const load = async () => {
      try {
        const now = new Date()
        const month = now.getMonth() + 1
        const year  = now.getFullYear()

        const [budgetRes, goalRes, txnRes] = await Promise.all([
          budgetsApi.withSpend({ month, year }),
          goalsApi.list(),
          transactionsApi.list({ month, year, type: 'expense' }),
        ])

        const built = []

        // Budget alerts — any category at 80%+
        budgetRes.data
          .filter(b => b.percentUsed >= 80)
          .forEach(b => {
            built.push({
              id: `budget-${b._id}`,
              type: 'Alerts',
              icon: '⚠️',
              title: `${b.category} at ${b.percentUsed}%`,
              body: b.percentUsed >= 100
                ? `You've gone over your ${b.category} budget this month.`
                : `You're close to your ${b.category} limit — ${b.percentUsed}% used so far.`,
              timestamp: 'This month',
              read: dismissedIds.includes(`budget-${b._id}`),
              actionLabel: 'Review budget',
              route: '/spending',
            })
          })

        // Savings milestones — goals that crossed 25/50/75/100%
        goalRes.data.forEach(g => {
          const pct = Math.round((g.savedAmount / g.targetAmount) * 100)
          const milestone = [100, 75, 50, 25].find(m => pct >= m)
          if (milestone) {
            built.push({
              id: `goal-${g._id}`,
              type: 'Alerts',
              icon: '🎯',
              title: `${g.name} hit ${milestone}%!`,
              body: `You've saved NPR ${g.savedAmount.toLocaleString('en-US')} of your NPR ${g.targetAmount.toLocaleString('en-US')} goal.`,
              timestamp: 'Updated recently',
              read: false,
              actionLabel: 'View goal',
              route: '/savings',
            })
          }
        })

        // Weekly summary — total expense this month
        const totalSpent = txnRes.data.reduce((s, t) => s + t.amount, 0)
        if (totalSpent > 0) {
          built.push({
            id: 'summary-month',
            type: 'Summaries',
            icon: '📊',
            title: 'Your spending summary',
            body: `You've spent NPR ${totalSpent.toLocaleString('en-US')} so far this month.`,
            timestamp: 'This month',
            read: false,
            actionLabel: 'View report',
            route: '/spending',
          })
        }

        // Tips reminder
        built.push({
          id: 'tip-reminder',
          type: 'Tips',
          icon: '💡',
          title: 'New financial tips available',
          body: 'Keep logging expenses to unlock more personalised financial literacy content.',
          timestamp: 'Ongoing',
          read: false,
          actionLabel: 'Read tips',
          route: '/tips',
        })

        setNotifications(built)
      } catch {
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const visible = useMemo(() => {
    let list = notifications.filter(n => !dismissedIds.includes(n.id))
    if (activeTab !== 'All') list = list.filter(n => n.type === activeTab)
    return list
  }, [notifications, dismissedIds, activeTab])

  const counts = useMemo(() => {
    const active = notifications.filter(n => !dismissedIds.includes(n.id))
    return {
      All: active.length,
      Alerts: active.filter(n => n.type === 'Alerts').length,
      Summaries: active.filter(n => n.type === 'Summaries').length,
      Tips: active.filter(n => n.type === 'Tips').length,
    }
  }, [notifications, dismissedIds])

  const handleDismiss = (id) => {
    const updated = [...dismissedIds, id]
    setDismissedIds(updated)
    setDismissed(updated)
  }

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id)
    setDismissedIds(allIds)
    setDismissed(allIds)
  }

  const handleAction = (notification) => {
    if (notification.route) router.push(notification.route)
  }

  return (
    <div className="fade-up">
      {/* Top bar */}
      <div className={styles.topRow}>
        <h1 className={styles.pageTitle}>Notifications</h1>
        <div className={styles.actions}>
          <button className={styles.ghostBtn} onClick={handleMarkAllRead}>Mark all as read</button>
          <button className={styles.ghostBtn} onClick={() => router.push('/settings')}>
            Notification settings
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.tabGroup}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} {counts[tab] > 0 && `(${counts[tab]})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className={styles.list}>
        {loading ? (
          <p className={styles.loadingText}>Loading notifications…</p>
        ) : visible.length === 0 ? (
          <p className={styles.emptyText}>You&apos;re all caught up! No notifications here.</p>
        ) : (
          visible.map(n => (
            <NotificationItem
              key={n.id}
              notification={n}
              onDismiss={handleDismiss}
              onAction={handleAction}
            />
          ))
        )}
      </div>
    </div>
  )
}