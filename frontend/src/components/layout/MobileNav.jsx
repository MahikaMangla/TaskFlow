import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useSidebar } from '../../context/SidebarContext'
import cn from '../../utils/cn'
import Sidebar from './Sidebar'

export default function MobileNav() {
  const { mobileOpen, setMobileOpen } = useSidebar()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setMobileOpen])

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[240px] transition-transform duration-300 ease-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="relative h-full">
          <Sidebar forceExpanded />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3.5 flex h-8 w-8 items-center justify-center rounded-lg bg-border-subtle text-text-secondary lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </>
  )
}
