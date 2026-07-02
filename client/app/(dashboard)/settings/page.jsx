'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useLocale } from '@/context/LocaleContext'
import { CURRENCIES, DATE_FORMATS } from '@/lib/format'
import { authApi, transactionsApi } from '@/lib/api'
import { exportTransactionsToCSV } from '@/lib/exportCsv'
import Toggle from '@/components/settings/Toggle'
import Dropdown from '@/components/settings/Dropdown'
import SettingsCard from '@/components/settings/SettingsCard'
import EditProfileModal from '@/components/settings/EditProfileModal'
import ChangePasswordModal from '@/components/settings/ChangePasswordModal'
import DeleteAccountModal from '@/components/settings/DeleteAccountModal'
import styles from './settings.module.css'

const ALERT_THRESHOLDS = [50, 60, 70, 80, 90]
const ACCENT_COLORS = ['#4F46E5', '#16A34A', '#D97706', '#DC2626', '#9333EA']

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateUser, logout } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [prefs, setPrefs] = useState({
    budgetAlerts: true,
    alertThreshold: 80,
    weeklySummary: true,
    savingsReminders: true,
    spendingInsights: true,
  })
  const { themePref, accent, density, setThemePreference, setAccent, setDensity } = useTheme()
  const { currency, dateFormat, setCurrency, setDateFormat, date } = useLocale()
  const [exporting, setExporting] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  useEffect(() => {
    if (user?.notificationPrefs) {
      setPrefs(user.notificationPrefs)
    }
  }, [user])

  const handleTogglePref = (key) => async (value) => {
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)
    persistPrefs(updated)
  }

  const handleThresholdChange = (val) => {
    const updated = { ...prefs, alertThreshold: val }
    setPrefs(updated)
    persistPrefs(updated)
  }

  const persistPrefs = async (updated) => {
    setSaving(true)
    setError('')
    try {
      const { user: updatedUser } = await authApi.updateMe({ notificationPrefs: updated })
      updateUser(updatedUser)
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } catch {
      setError('Could not save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const { data } = await transactionsApi.list({})
      exportTransactionsToCSV(data, date, 'fintrack-transactions.csv')
    } catch {
      setError('Could not export data.')
    } finally {
      setExporting(false)
    }
  }

  const handleSaveProfile = async (payload) => {
    const { user: updatedUser } = await authApi.updateMe(payload)
    updateUser(updatedUser)
  }

  const handleChangePassword = async (payload) => {
    await authApi.changePassword(payload)
  }

  const handleDeleteAccount = async (password) => {
    await authApi.deleteAccount({ password })
    await logout() // clears local session state
    router.replace('/login')
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'FT'

  return (
    <div className="fade-up">
      <div className={styles.topRow}>
        <h1 className={styles.pageTitle}>Settings</h1>
        {saving && <span className={styles.savingTag}>Saving…</span>}
        {saved && <span className={styles.savedTag}>✓ Saved</span>}
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.layout}>
        {/* Left column */}
        <div className={styles.col}>
          <SettingsCard title="Profile">
            <div className={styles.profileRow}>
              <div className={styles.avatar}>
                {user?.avatar
                  ? <img src={user.avatar} alt="Avatar" className={styles.avatarImg} />
                  : initials
                }
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{user?.firstName} {user?.lastName}</span>
                <span className={styles.profileEmail}>{user?.email}</span>
              </div>
            </div>
            <div className={styles.btnRow}>
              <button className={styles.ghostBtn} onClick={() => setShowEditProfile(true)}>Edit profile</button>
              <button className={styles.ghostBtn} onClick={() => setShowChangePassword(true)}>Change password</button>
            </div>
          </SettingsCard>

          <SettingsCard title="Currency & Region">
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Currency</span>
              <Dropdown
                value={currency}
                onChange={setCurrency}
                options={Object.values(CURRENCIES).map(c => ({
                  value: c.code,
                  label: `${c.code} — ${c.label}`,
                }))}
              />
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Date format</span>
              <Dropdown
                value={dateFormat}
                onChange={setDateFormat}
                options={Object.entries(DATE_FORMATS).map(([value, { label }]) => ({ value, label }))}
              />
            </div>
          </SettingsCard>
        </div>

        {/* Right column */}
        <div className={styles.col}>
          <SettingsCard title="Notifications">
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Budget alerts</span>
              <Toggle checked={prefs.budgetAlerts} onChange={handleTogglePref('budgetAlerts')} />
            </div>

            <div className={styles.thresholdRow}>
              <span className={styles.fieldLabel}>Alert threshold</span>
              <div className={styles.thresholdPills}>
                {ALERT_THRESHOLDS.map(t => (
                  <button
                    key={t}
                    className={`${styles.thresholdPill} ${prefs.alertThreshold === t ? styles.thresholdActive : ''}`}
                    onClick={() => handleThresholdChange(t)}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Weekly summary</span>
              <Toggle checked={prefs.weeklySummary} onChange={handleTogglePref('weeklySummary')} />
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Savings reminders</span>
              <Toggle checked={prefs.savingsReminders} onChange={handleTogglePref('savingsReminders')} />
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Spending insights</span>
              <Toggle checked={prefs.spendingInsights} onChange={handleTogglePref('spendingInsights')} />
            </div>
          </SettingsCard>

          <SettingsCard title="Appearance">
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Theme</span>
              <div className={styles.themePills}>
                {[{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }].map(({ label, value }) => (
                  <button
                    key={value}
                    className={`${styles.themePill} ${themePref === value ? styles.themeActive : ''}`}
                    onClick={() => setThemePreference(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Compact view</span>
              <Toggle
                checked={density === 'compact'}
                onChange={(checked) => setDensity(checked ? 'compact' : 'comfortable')}
              />
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Accent colour</span>
              <div className={styles.swatchRow}>
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c}
                    className={`${styles.swatch} ${accent === c ? styles.swatchActive : ''}`}
                    style={{ background: c }}
                    onClick={() => setAccent(c)}
                    aria-label={`Set accent colour ${c}`}
                  />
                ))}
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Data & Privacy">
            <button className={styles.ghostBtnFull} onClick={handleExportCSV} disabled={exporting}>
              {exporting ? 'Exporting…' : 'Export all data (CSV)'}
            </button>
            <button className={styles.dangerBtnFull} onClick={() => setShowDeleteAccount(true)}>
              Delete account
            </button>
          </SettingsCard>
        </div>
      </div>

      {showEditProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSave={handleChangePassword}
        />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal
          userEmail={user?.email}
          onClose={() => setShowDeleteAccount(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  )
}