'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Drives two animation effects on every route change:
 *   B — a thin accent progress bar at the very top of the screen
 *   A — a gradient sweep that rises from the bottom
 *
 * Both are CSS-only animations triggered by injecting/removing DOM elements,
 * so there's zero JS animation loop running — clean and performant.
 */
export default function NavigationProgress() {
  const pathname = usePathname()
  const prevPath = useRef(pathname)

  useEffect(() => {
    // Don't fire on the very first mount — only on actual navigations
    if (prevPath.current === pathname) return
    prevPath.current = pathname

    // Create and inject the progress bar (B)
    const bar = document.createElement('div')
    bar.className = 'nav-progress'
    document.body.appendChild(bar)

    // Create and inject the sweep (A)
    const sweep = document.createElement('div')
    sweep.className = 'page-sweep'
    document.body.appendChild(sweep)

    // Remove both after their animations complete (1.5s)
    const timer = setTimeout(() => {
      bar.remove()
      sweep.remove()
    }, 1500)

    return () => {
      clearTimeout(timer)
      bar.remove()
      sweep.remove()
    }
  }, [pathname])

  return null // purely side-effect driven, renders nothing
}