import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import RootProviders from '@/components/providers/RootProviders'
import NavigationProgress from '@/components/ui/NavigationProgress'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'FinTrack — Personal Finance Dashboard',
  description: 'Track spending, set savings goals, and understand your finances.',
}

// Runs before React hydrates — prevents a flash of light mode for dark-mode users.
// Reads the same localStorage keys that ThemeContext writes to, so they stay in sync.
const themeInitScript = `
(function() {
  try {
    var themePref = localStorage.getItem('fintrack_theme') || 'light';
    var accent = localStorage.getItem('fintrack_accent') || '#4F46E5';
    var density = localStorage.getItem('fintrack_density') || 'comfortable';
    var resolved = themePref;
    if (themePref === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-density', density);
    document.documentElement.style.setProperty('--accent', accent);
  } catch (e) {}
})();
`

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        <RootProviders>
          <NavigationProgress />
          {children}
        </RootProviders>
      </body>
    </html>
  )
}