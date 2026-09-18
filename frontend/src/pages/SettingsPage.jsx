import { Bell, Building2, Check, Palette, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useTeam } from '../context/TeamContext'
import { useAuth } from '../hooks/useAuth'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { user, refreshUser } = useAuth()
  const { workspace, fetchWorkspace, updateMember } = useTeam()
  const [name, setName] = useState(user?.name ?? '')
  const [preferences, setPreferences] = useState({ emailNotifications: true, taskNotifications: true })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWorkspace().catch(() => {})
  }, [fetchWorkspace])

  const handleDarkModeChange = (value) => {
    if (value !== (theme === 'dark')) toggleTheme()
  }

  const handleSave = async () => {
    if (!user || !name.trim()) {
      setError('Name is required.')
      return
    }
    setStatus('saving')
    setError('')
    try {
      if (name.trim() !== user.name) {
        await updateMember(user.id, { name: name.trim() })
        await refreshUser()
      }
      setStatus('saved')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('idle')
    }
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div><h1 className="text-2xl font-semibold text-text-primary">Settings</h1><p className="mt-1 text-sm text-text-secondary">Manage your profile, workspace and preferences.</p></div>

      <section className="rounded-xl border border-border bg-surface-raised p-6">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted"><User className="h-4 w-4 text-accent" /></div><div><h2 className="font-semibold text-text-primary">Profile</h2><p className="text-xs text-text-tertiary">Update your personal information.</p></div></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5"><span className="text-sm font-medium text-text-secondary">Name</span><input value={name} onChange={(event) => { setName(event.target.value); setStatus('idle') }} className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20" /></label>
          <label className="space-y-1.5"><span className="text-sm font-medium text-text-secondary">Email</span><input value={user?.email ?? ''} disabled className="h-10 w-full rounded-lg border border-border bg-border-subtle px-3 text-sm text-text-secondary outline-none disabled:cursor-not-allowed" /><span className="block text-xs text-text-tertiary">Email changes are not supported by the current backend.</span></label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface-raised p-6">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted"><Building2 className="h-4 w-4 text-accent" /></div><div><h2 className="font-semibold text-text-primary">Workspace</h2><p className="text-xs text-text-tertiary">Workspace information available to your account.</p></div></div>
        <label className="mt-5 block max-w-md space-y-1.5"><span className="text-sm font-medium text-text-secondary">Workspace name</span><input value={workspace?.name ?? ''} disabled className="h-10 w-full rounded-lg border border-border bg-border-subtle px-3 text-sm text-text-secondary outline-none disabled:cursor-not-allowed" /><span className="block text-xs text-text-tertiary">Workspace updates are not available with the current backend.</span></label>
      </section>

      <section className="rounded-xl border border-border bg-surface-raised p-6">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted"><Bell className="h-4 w-4 text-accent" /></div><div><h2 className="font-semibold text-text-primary">Notifications</h2><p className="text-xs text-text-tertiary">These preferences are local to this browser session and are not synced.</p></div></div>
        <div className="mt-5 space-y-4"><SettingToggle label="Email notifications" description="Receive important updates by email." checked={preferences.emailNotifications} onChange={(value) => setPreferences((current) => ({ ...current, emailNotifications: value }))} /><SettingToggle label="Task notifications" description="Get notified about task assignments and updates." checked={preferences.taskNotifications} onChange={(value) => setPreferences((current) => ({ ...current, taskNotifications: value }))} /></div>
      </section>

      <section className="rounded-xl border border-border bg-surface-raised p-6">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted"><Palette className="h-4 w-4 text-accent" /></div><div><h2 className="font-semibold text-text-primary">Appearance</h2><p className="text-xs text-text-tertiary">Customize how TaskFlow looks on this device.</p></div></div>
        <div className="mt-5"><SettingToggle label="Dark mode" description="This setting is saved locally on this device." checked={theme === 'dark'} onChange={handleDarkModeChange} /></div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {error && <span role="alert" className="text-sm text-danger">{error}</span>}
        {status === 'saved' && <span className="flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" />Profile updated</span>}
        <button type="button" onClick={handleSave} disabled={status === 'saving'} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{status === 'saving' ? 'Saving...' : 'Save profile'}</button>
      </div>
    </div>
  )
}

function SettingToggle({ label, description, checked, onChange }) {
  return <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-text-primary">{label}</p><p className="mt-0.5 text-xs text-text-tertiary">{description}</p></div><button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 ${checked ? 'border-accent bg-accent' : 'border-border bg-border-subtle'}`}><span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>
}
