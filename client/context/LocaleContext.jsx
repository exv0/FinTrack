'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { DEFAULT_CURRENCY, DEFAULT_DATE_FORMAT, formatCurrency, formatDate } from '@/lib/format'

const LocaleContext = createContext(null)

const CURRENCY_KEY = 'fintrack_currency'
const DATE_FORMAT_KEY = 'fintrack_date_format'

export function LocaleProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY)
  const [dateFormat, setDateFormatState] = useState(DEFAULT_DATE_FORMAT)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setCurrencyState(localStorage.getItem(CURRENCY_KEY) || DEFAULT_CURRENCY)
    setDateFormatState(localStorage.getItem(DATE_FORMAT_KEY) || DEFAULT_DATE_FORMAT)
    setReady(true)
  }, [])

  const setCurrency = (code) => {
    setCurrencyState(code)
    localStorage.setItem(CURRENCY_KEY, code)
  }

  const setDateFormat = (pattern) => {
    setDateFormatState(pattern)
    localStorage.setItem(DATE_FORMAT_KEY, pattern)
  }

  // Convenience wrappers so screens don't need to import lib/format directly —
  // they just call money(amount) / date(value) and get the user's preference applied.
  const money = (amountInNPR, options) => formatCurrency(amountInNPR, currency, options)
  const date  = (value) => formatDate(value, dateFormat)

  return (
    <LocaleContext.Provider value={{ currency, dateFormat, setCurrency, setDateFormat, money, date, ready }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}