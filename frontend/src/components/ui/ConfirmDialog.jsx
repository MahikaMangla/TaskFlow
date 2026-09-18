import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import Modal, { ModalFooter } from './Modal'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-muted">
          <AlertTriangle className="h-5 w-5 text-danger" strokeWidth={1.5} />
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
