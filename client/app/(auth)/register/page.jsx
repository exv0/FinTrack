'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import styles from './register.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: ''
  })
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)
  const [showPw2, setShowPw2]   = useState(false)
  const [apiError, setApiError] = useState('')
  const [terms, setTerms]       = useState(false)
  const [strength, setStrength] = useState(0)

  const getStrength = (pw) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
    if (/\d/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }

  const strengthLabel = ['', 'Too weak', 'Could be stronger', 'Almost there', 'Strong password ✓']
  const strengthColor = ['', 'var(--danger)', 'var(--warning)', '#FBBF24', 'var(--success)']

  const handleChange = (field) => (ev) => {
    const val = ev.target.value
    setForm(f => ({ ...f, [field]: val }))
    if (field === 'password') setStrength(getStrength(val))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
    if (apiError) setApiError('')
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required.'
    if (!form.lastName.trim())  e.lastName  = 'Last name is required.'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Please enter a valid email address.'
    if (form.password.length < 8)
      e.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords don't match."
    if (!terms)
      e.terms = 'You must accept the terms to continue.'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    setApiError('')
    try {
      await register({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        password:  form.password,
      })
      router.replace('/onboarding/income')
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.card}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>FT</div>
        <span className={styles.logoWord}>FinTrack</span>
      </div>
      <p className={styles.subtitle}>Create your free account</p>
      <div className={styles.divider} />

      {apiError && <div className={styles.errorBanner}>{apiError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Name row */}
        <div className={styles.nameRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="firstName">First name</label>
            <input
              id="firstName" type="text" autoComplete="given-name"
              placeholder="Sita"
              value={form.firstName} onChange={handleChange('firstName')}
              className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
            />
            {errors.firstName && <span className={styles.fieldError}>{errors.firstName}</span>}
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="lastName">Last name</label>
            <input
              id="lastName" type="text" autoComplete="family-name"
              placeholder="Sharma"
              value={form.lastName} onChange={handleChange('lastName')}
              className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
            />
            {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
          </div>
        </div>

        {/* Email */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="email">Email address</label>
          <input
            id="email" type="email" autoComplete="email"
            placeholder="you@example.com"
            value={form.email} onChange={handleChange('email')}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </div>

        {/* Password */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">Password</label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password} onChange={handleChange('password')}
              className={`${styles.input} ${styles.inputPadRight} ${errors.password ? styles.inputError : ''}`}
            />
            <button type="button" className={styles.pwToggle}
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Strength meter */}
          {form.password && (
            <div className={styles.strengthWrap}>
              <div className={styles.strengthBar}>
                {[1,2,3,4].map(i => (
                  <div
                    key={i}
                    className={styles.strengthSeg}
                    style={{ background: i <= strength ? strengthColor[strength] : 'var(--border)' }}
                  />
                ))}
              </div>
              <span className={styles.strengthLabel} style={{ color: strengthColor[strength] }}>
                {strengthLabel[strength]}
              </span>
            </div>
          )}
          {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
        </div>

        {/* Confirm password */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="confirmPassword">Confirm password</label>
          <div className={styles.inputWrap}>
            <input
              id="confirmPassword"
              type={showPw2 ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirmPassword} onChange={handleChange('confirmPassword')}
              className={`${styles.input} ${styles.inputPadRight} ${errors.confirmPassword ? styles.inputError : ''}`}
            />
            <button type="button" className={styles.pwToggle}
              onClick={() => setShowPw2(v => !v)}
              aria-label={showPw2 ? 'Hide password' : 'Show password'}>
              {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
        </div>

        {/* Terms */}
        <div className={styles.termsRow}>
          <input
            type="checkbox" id="terms"
            checked={terms}
            onChange={e => { setTerms(e.target.checked); if (errors.terms) setErrors(v => ({...v, terms: ''})) }}
            className={styles.checkbox}
          />
          <label htmlFor="terms" className={styles.termsLabel}>
            I agree to the{' '}
            <a href="#" className={styles.termsLink} onClick={e => e.preventDefault()}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" className={styles.termsLink} onClick={e => e.preventDefault()}>Privacy Policy</a>
          </label>
        </div>
        {errors.terms && <span className={styles.fieldError} style={{marginTop: '-8px', marginBottom: '12px', display: 'block'}}>{errors.terms}</span>}

        {/* Submit */}
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : 'Create account'}
        </button>
      </form>

      <div className={styles.orDivider}><span>or</span></div>

      <button className={styles.btnGhost} type="button" disabled title="Google sign-in is not available yet">
        <GoogleIcon />
        Continue with Google
      </button>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link href="/login" className={styles.footerLink}>Sign in →</Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}