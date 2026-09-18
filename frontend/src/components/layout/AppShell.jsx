import { Outlet } from 'react-router-dom'
import { SidebarProvider, useSidebar } from '../../context/SidebarContext'
import cn from '../../utils/cn'
import MobileNav from './MobileNav'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppShellContent() {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-dvh bg-surface">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <MobileNav />

      <div
        className={cn(
          'flex min-h-dvh flex-col transition-all duration-300 ease-out',
          collapsed ? 'lg:pl-[68px]' : 'lg:pl-[240px]',
        )}
      >
        <Topbar />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function AppShell() {
  return (
    <SidebarProvider>
      <AppShellContent />
    </SidebarProvider>
  )
}
