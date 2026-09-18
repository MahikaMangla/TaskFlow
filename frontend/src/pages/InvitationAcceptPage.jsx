import { AlertCircle, ArrowRight, LoaderCircle, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../lib/api'

function errorMessage(error) {
  return typeof error?.message === 'string' && error.message.trim()
    ? error.message
    : 'Unable to load this invitation.'
}

export default function InvitationAcceptPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, acceptInvitation, logout } = useAuth()
  const token = new URLSearchParams(location.search).get('token') ?? ''
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState(() => token ? 'loading' : 'error')
  const [error, setError] = useState(() => token ? '' : 'Invitation token is missing.')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false
    apiRequest(`/invitations/preview?token=${encodeURIComponent(token)}`)
      .then((response) => {
        if (!cancelled) {
          setPreview(response)
          setStatus('success')
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(errorMessage(requestError))
          setStatus('error')
        }
      })
    return () => { cancelled = true }
  }, [token])

  const submit = async (event) => {
    event.preventDefault()
    if (preview?.requiresAccount && (name.trim().length < 2 || password.length < 8 || password !== confirmPassword)) {
      setError(password !== confirmPassword ? 'Passwords do not match.' : 'Enter your name and a password of at least 8 characters.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await acceptInvitation(preview?.requiresAccount ? { token, name: name.trim(), password } : { token })
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const signInTarget = { pathname: '/accept-invitation', search: location.search }
  const invitation = preview?.invitation
  const invitedEmail = invitation?.email?.toLowerCase() ?? ''
  const signedInWithInvitedEmail = Boolean(user?.email && user.email.toLowerCase() === invitedEmail)
  const needsSignIn = Boolean(preview?.requiresSignIn && !signedInWithInvitedEmail)

  const startSignIn = async () => {
    if (user) await logout()
    navigate('/login', { state: { from: signInTarget } })
  }

  return <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-4 py-10">
    <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
    <section className="relative w-full max-w-[420px] animate-slide-up">
      <div className="mb-8 flex items-center justify-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-sm shadow-accent/25"><Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.5} /></span><span className="text-lg font-semibold tracking-tight text-text-primary">TaskFlow</span></div>
      <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-sm sm:p-8">
        {status === 'loading' && <div className="flex items-center justify-center gap-2 py-12 text-sm text-text-secondary"><LoaderCircle className="h-4 w-4 animate-spin" />Loading invitation…</div>}
        {status === 'error' && <><div role="alert" className="flex gap-2 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2.5 text-sm text-danger"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div><Link to="/login" className="mt-5 inline-block text-sm font-medium text-accent hover:text-accent-hover">Back to sign in</Link></>}
        {status === 'success' && <>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">Workspace invitation</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Join {invitation.workspace.name}</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">You were invited as a {invitation.role}. {invitation.inviter?.name ? `${invitation.inviter.name} sent this invitation.` : ''}</p>
          {error && <div role="alert" className="mt-5 flex gap-2 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2.5 text-sm text-danger"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          {needsSignIn ? <div className="mt-6 space-y-4"><p className="text-sm text-text-secondary">Sign in with <span className="font-medium text-text-primary">{invitation.email}</span> to accept this invitation.</p>{user && <p className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-sm text-danger">You are signed in with a different email address.</p>}<Button variant="primary" size="lg" className="w-full" onClick={startSignIn}>Sign in to accept <ArrowRight className="h-4 w-4" /></Button></div> : <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
            {preview.requiresAccount && <><Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /><Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" hint="At least 8 characters, including a letter and number." required /><Input label="Confirm password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required /></>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>{submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />Joining workspace…</> : <>Join workspace <ArrowRight className="h-4 w-4" /></>}</Button>
          </form>}
        </>}
      </div>
    </section>
  </main>
}
