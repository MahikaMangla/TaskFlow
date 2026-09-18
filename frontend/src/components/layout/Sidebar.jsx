import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Timer,
  Users,
  Zap,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useSidebar } from '../../context/SidebarContext'
import { navItems, secondaryNavItems } from '../../data/dashboardData'
import cn from '../../utils/cn'
import Tooltip from '../ui/Tooltip'

const iconMap = {
  'layout-dashboard': LayoutDashboard,
  'folder-kanban': FolderKanban,
  'check-square': CheckSquare,
  timer: Timer,
  users: Users,
  'bar-chart-3': BarChart3,
  settings: Settings,
  'help-circle': HelpCircle,
}

function NavItem({ item, collapsed }) {
  const Icon = iconMap[item.icon]

  const link = (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
          'transition-all duration-150',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-accent-muted text-accent'
            : 'text-text-secondary hover:bg-border-subtle hover:text-text-primary',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'h-[18px] w-[18px] shrink-0',
              isActive ? 'text-accent' : 'text-text-tertiary group-hover:text-text-secondary',
            )}
            strokeWidth={isActive ? 2 : 1.5}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {isActive && !collapsed && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
          )}
        </>
      )}
    </NavLink>
  )

  if (collapsed) {
    return <Tooltip content={item.label}>{link}</Tooltip>
  }

  return link
}

export default function Sidebar({ forceExpanded = false }) {
  const { collapsed, toggleCollapsed, setMobileOpen } = useSidebar()
  const isCollapsed = forceExpanded ? false : collapsed

  const handleNavClick = () => setMobileOpen(false)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col',
        'border-r border-sidebar-border bg-sidebar',
        'transition-all duration-300 ease-out',
        isCollapsed ? 'w-[68px]' : 'w-[240px]',
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center border-b border-sidebar-border px-4',
          isCollapsed && 'justify-center px-0',
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <span className="text-base font-semibold tracking-tight text-text-primary">
              TaskFlow
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" onClick={handleNavClick}>
        {!isCollapsed && (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Main
          </p>
        )}
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavItem item={item} collapsed={isCollapsed} />
            </li>
          ))}
        </ul>

        <div className="my-4 h-px bg-border" />

        {!isCollapsed && (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            Support
          </p>
        )}
        <ul className="space-y-0.5">
          {secondaryNavItems.map((item) => (
            <li key={item.id}>
              <NavItem item={item} collapsed={isCollapsed} />
            </li>
          ))}
        </ul>
      </nav>

      {!forceExpanded && (
        <div className="hidden border-t border-sidebar-border p-3 lg:block">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2',
              'text-sm text-text-tertiary transition-colors hover:bg-border-subtle hover:text-text-secondary',
              isCollapsed && 'justify-center px-0',
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isCollapsed && 'rotate-180',
              )}
              strokeWidth={1.5}
            />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      )}
    </aside>
  )
}
