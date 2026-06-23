import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{
          flex: 1,
          marginLeft: 'var(--sidebar-w)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}>
          <Topbar />
          <main style={{
            flex: 1,
            padding: '24px',
            paddingTop: 'calc(var(--topbar-h) + 24px)',
            background: 'var(--bg)',
          }}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}