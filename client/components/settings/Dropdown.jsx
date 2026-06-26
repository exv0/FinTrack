'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import styles from './Dropdown.module.css'

export default function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(v => !v)}
      >
        {selected?.label ?? value}
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' }} />
      </button>

      {open && (
        <div className={styles.menu}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={styles.item}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check size={14} className={styles.check} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}