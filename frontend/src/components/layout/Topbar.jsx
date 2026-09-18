import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../../context/SidebarContext'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import DropdownMenu, {
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from '../ui/DropdownMenu'
import cn from '../../utils/cn'

function NotificationDropdown() {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu
      open={open}
      onClose={() => setOpen(false)}
      align="end"
      className="w-80"
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />

        </Button>
      }
    >
      <DropdownLabel>Notifications</DropdownLabel>
      <p className="px-3 py-4 text-sm text-text-secondary">Notifications are not available yet.</p>
    </DropdownMenu>
  )
}

function UserMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const goTo = (path) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <DropdownMenu
      open={open}
      onClose={() => setOpen(false)}
      align="end"
      trigger={
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-border-subtle"
        >
          <Avatar
            name={user.name}
            initials={user.initials}
            size="sm"
          />

          <div className="hidden text-left md:block">
            <p className="text-sm font-medium leading-tight text-text-primary">
              {user.name}
            </p>

            <p className="text-[11px] text-text-tertiary">
              {user.title || user.roleKey || 'Member'}
            </p>
          </div>

          <ChevronDown
            className="hidden h-3.5 w-3.5 text-text-tertiary md:block"
            strokeWidth={1.5}
          />
        </button>
      }
    >
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-text-primary">
          {user.name}
        </p>

        <p className="text-xs text-text-secondary">
          {user.email}
        </p>
      </div>

      <DropdownSeparator />

      <DropdownItem
        icon={User}
        onClick={() => goTo('/settings')}
      >
        Profile
      </DropdownItem>

      <DropdownItem
        icon={Settings}
        onClick={() => goTo('/settings')}
      >
        Settings
      </DropdownItem>

      <DropdownSeparator />

      <DropdownItem
        icon={LogOut}
        destructive
        onClick={async () => {
          setOpen(false)
          await logout()
          navigate('/login', { replace: true })
        }}
      >
        Sign out
      </DropdownItem>
    </DropdownMenu>
  )
}

export default function Topbar() {
  const { theme, toggleTheme } = useTheme()
  const { collapsed, setMobileOpen } = useSidebar()
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur-md lg:px-6',
        collapsed ? 'lg:pl-[84px]' : 'lg:pl-[256px]',
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </Button>

      <div
        className={cn(
          'relative max-w-md flex-1 transition-all duration-200',
          searchFocused && 'max-w-lg',
        )}
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
          strokeWidth={1.5}
        />

        <input
          type="search"
          placeholder="Search tasks, projects, people..."
          className={cn(
            'h-9 w-full rounded-lg border border-border bg-border-subtle/50 pl-9 pr-4',
            'text-sm text-text-primary placeholder:text-text-tertiary',
            'transition-all duration-200',
            'focus:border-accent/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20',
          )}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />

        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary sm:inline-block">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={
            theme === 'light'
              ? 'Switch to dark mode'
              : 'Switch to light mode'
          }
        >
          {theme === 'light' ? (
            <Moon
              className="h-[18px] w-[18px]"
              strokeWidth={1.5}
            />
          ) : (
            <Sun
              className="h-[18px] w-[18px]"
              strokeWidth={1.5}
            />
          )}
        </Button>

        <NotificationDropdown />

        <UserMenu />
      </div>
    </header>
  )
}
