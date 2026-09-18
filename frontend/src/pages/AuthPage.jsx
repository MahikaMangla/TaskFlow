import { AlertCircle, ArrowRight, LoaderCircle, Zap } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const initialLogin = { email: '', password: '' }
const initialSignup = { name: '', workspaceName: '', email: '', password: '', confirmPassword: '' }

function textValue(value) {
  return typeof value === 'string' ? value : ''
}

function validate(values, mode) {
  const errors = {}
  const name = textValue(values.name)
  const workspaceName = textValue(values.workspaceName)
  const email = textValue(values.email)
  const password = textValue(values.password)
  const confirmPassword = textValue(values.confirmPassword)
  if (mode === 'signup' && name.trim().length < 2) errors.name = 'Enter at least 2 characters.'
  if (mode === 'signup' && workspaceName && workspaceName.trim().length < 2) errors.workspaceName = 'Enter at least 2 characters.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (password.length < 8) errors.password = 'Use at least 8 characters.'
  else if (mode === 'signup' && (!/[A-Za-z]/.test(password) || !/\d/.test(password))) errors.password = 'Include at least one letter and number.'
  if (mode === 'signup' && confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const [values, setValues] = useState(isSignup ? initialSignup : initialLogin)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(values, mode)
    setErrors(nextErrors)
    setApiError('')
    if (Object.keys(nextErrors).length) return
    setSubmitting(true)
    try {
      const name = textValue(values.name)
      const workspaceName = textValue(values.workspaceName)
      const email = textValue(values.email)
      const password = textValue(values.password)
      if (isSignup) await signup({ name: name.trim(), workspaceName: workspaceName.trim() || undefined, email: email.trim(), password })
      else await login({ email: email.trim(), password })
      navigate(location.state?.from ?? '/', { replace: true })
    } catch (error) {
      setApiError(typeof error?.message === 'string' && error.message.trim() ? error.message : 'Unable to complete authentication. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <section className="relative w-full max-w-[420px] animate-slide-up">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-sm shadow-accent/25"><Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.5} /></span>
          <span className="text-lg font-semibold tracking-tight text-text-primary">TaskFlow</span>
        </div>
        <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">{isSignup ? 'Get started' : 'Welcome back'}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{isSignup ? 'Create your workspace' : 'Sign in to TaskFlow'}</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{isSignup ? 'Bring your projects, tasks, and team into one focused workspace.' : 'Enter your details to continue where you left off.'}</p>
          {apiError && <div role="alert" className="mt-5 flex gap-2 rounded-lg border border-danger/20 bg-danger-muted px-3 py-2.5 text-sm text-danger"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{apiError}</div>}
          <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
            {isSignup && <Input label="Full name" name="name" autoComplete="name" value={values.name} onChange={update} error={errors.name} required placeholder="Alex Morgan" />}
            {isSignup && <Input label="Workspace name" name="workspaceName" autoComplete="organization" value={values.workspaceName} onChange={update} error={errors.workspaceName} hint="Optional — we’ll create one from your name if blank." placeholder="Acme Studio" />}
            <Input label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={update} error={errors.email} required placeholder="you@example.com" />
            <Input label="Password" name="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={values.password} onChange={update} error={errors.password} required hint={isSignup ? 'At least 8 characters, including a letter and number.' : undefined} placeholder="••••••••" />
            {isSignup && <Input label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={update} error={errors.confirmPassword} required placeholder="••••••••" />}
            <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={submitting}>{submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />{isSignup ? 'Creating workspace…' : 'Signing in…'}</> : <>{isSignup ? 'Create workspace' : 'Sign in'}<ArrowRight className="h-4 w-4" /></>}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-text-secondary">{isSignup ? 'Already have an account?' : 'New to TaskFlow?'} <Link to={isSignup ? '/login' : '/signup'} className="font-medium text-accent transition-colors hover:text-accent-hover">{isSignup ? 'Sign in' : 'Create an account'}</Link></p>
        </div>
      </section>
    </main>
  )
}
