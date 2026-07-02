'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, BarChart2, ArrowUpDown, Target,
  Lightbulb, Bell, Settings, LogOut,
} from 'lucide-react'
import styles from './Sidebar.module.css'

const navItems = [
  { label: 'Dashboard',        href: '/dashboard',      icon: LayoutDashboard },
  { label: 'Spending',         href: '/spending',       icon: BarChart2 },
  { label: 'Income & Expenses',href: '/income-expense', icon: ArrowUpDown },
  { label: 'Savings Goals',    href: '/savings',        icon: Target },
  { label: 'Tips & Literacy',  href: '/tips',           icon: Lightbulb },
  { label: 'Notifications',    href: '/notifications',  icon: Bell },
  { label: 'Settings',         href: '/settings',       icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'FT'

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>FT</div>
        <span className={styles.logoWord}>FinTrack</span>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className={styles.footer}>
        <div className={styles.avatar}>
          {user?.avatar
            ? <img src={user.avatar} alt="Avatar" className={styles.avatarImg} />
            : initials
          }
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
          <button className={styles.signOut} onClick={handleLogout}>
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}