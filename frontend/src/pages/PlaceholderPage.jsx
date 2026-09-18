import { Construction } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'

const pageTitles = {
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/sprints': 'Sprints',
  '/team': 'Team',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/help': 'Help & Support',
}

export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] || 'Page'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-muted">
        <Construction className="h-6 w-6 text-accent" strokeWidth={1.5} />
      </div>
      <h1 className="mt-5 text-xl font-semibold text-text-primary">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        This section is coming soon. The dashboard shell and navigation are ready
        for when you build out this feature.
      </p>
      <Button variant="secondary" size="sm" className="mt-6" onClick={() => window.history.back()}>
        Go back
      </Button>
    </div>
  )
}
