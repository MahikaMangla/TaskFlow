import { FolderPlus, Plus, Timer, Users } from 'lucide-react'
import Button from '../ui/Button'
import { useNavigate } from 'react-router-dom'

const actions = [
  { id: 'new-task', label: 'New Task', icon: Plus, variant: 'primary' },
  { id: 'new-project', label: 'New Project', icon: FolderPlus, variant: 'secondary' },
  { id: 'start-sprint', label: 'Start Sprint', icon: Timer, variant: 'secondary' },
  { id: 'invite', label: 'Invite Member', icon: Users, variant: 'ghost' },
]

export default function QuickActions() {
  const navigate = useNavigate()
  const destinations = {
    'new-task': ['/tasks', { openTaskForm: true }],
    'new-project': ['/projects', { openProjectForm: true }],
    'start-sprint': ['/sprints', { openSprintForm: true }],
    invite: ['/team', { openInviteForm: true }],
  }
  return (
    <div className="flex flex-wrap items-center gap-2 animate-slide-up">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant}
          size="md"
          className="shadow-none"
          onClick={() => {
            const [path, state] = destinations[action.id]
            navigate(path, { state })
          }}
        >
          <action.icon className="h-4 w-4" strokeWidth={action.variant === 'primary' ? 2 : 1.5} />
          <span className="hidden sm:inline">{action.label}</span>
          <span className="sm:hidden">{action.label.split(' ').pop()}</span>
        </Button>
      ))}
    </div>
  )
}
