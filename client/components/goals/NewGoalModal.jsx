'use client'

import { useState } from 'react'
import { X, Trash2, ImagePlus } from 'lucide-react'
import { pickAndConvertImage } from '@/lib/imageUpload'
import styles from './GoalModal.module.css'

function toDateInputValue(value) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function NewGoalModal({ goal = null, onClose, onCreate, onSave, onDelete }) {
  const isEditMode = Boolean(goal)

  const [form, setForm] = useState({
    name:         goal?.name ?? '',
    targetAmount: goal?.targetAmount ?? '',
    deadline:     toDateInputValue(goal?.deadline),
  })
  const [photoPreview, setPhotoPreview] = useState(goal?.photo || null)
  const [photoBase64, setPhotoBase64]   = useState(null)
  const [photoError, setPhotoError]     = useState('')
  const [loading, setLoading]           = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [error, setError]               = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (error) setError('')
  }

  const handlePickPhoto = async () => {
    setPhotoError('')
    const { base64, error: pickError } = await pickAndConvertImage()
    if (pickError) { setPhotoError(pickError); return }
    if (!base64) return
    setPhotoPreview(base64)
    setPhotoBase64(base64)
  }

  const handleRemovePhoto = () => {
    setPhotoPreview(null)
    setPhotoBase64('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Goal name is required.'); return }
    if (!form.targetAmount || Number(form.targetAmount) <= 0) {
      setError('Target amount must be greater than zero.')
      return
    }

    const payload = {
      name:         form.name.trim(),
      targetAmount: Number(form.targetAmount),
      deadline:     form.deadline || undefined,
    }
    if (photoBase64 !== null) payload.photo = photoBase64

    setLoading(true)
    try {
      if (isEditMode) {
        await onSave(goal._id, payload)
      } else {
        await onCreate(payload)
      }
      onClose()
    } catch {
      setError(isEditMode ? 'Could not update goal.' : 'Could not create goal.')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(goal._id)
      onClose()
    } catch {
      setError('Could not delete goal. Please try again.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditMode ? 'Edit goal' : 'Create new goal'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {!confirmDelete ? (
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            {/* Goal photo */}
            <div className={styles.photoSection}>
              {photoPreview ? (
                <div className={styles.photoPreviewWrap}>
                  <img src={photoPreview} alt="Goal photo preview" className={styles.photoPreview} />
                  <button type="button" className={styles.photoRemoveBtn} onClick={handleRemovePhoto}>
                    Remove photo
                  </button>
                </div>
              ) : (
                <button type="button" className={styles.photoPickerBtn} onClick={handlePickPhoto}>
                  <ImagePlus size={20} className={styles.photoPickerIcon} />
                  <span>Add a photo for your goal</span>
                  <span className={styles.photoPickerHint}>JPEG, PNG or WebP · Max 2MB</span>
                </button>
              )}
              {photoError && <p className={styles.photoError}>{photoError}</p>}
            </div>

            <label className={styles.label} htmlFor="goalName">Goal name</label>
            <input
              id="goalName"
              type="text"
              placeholder="e.g. Trip to Pokhara"
              value={form.name}
              onChange={handleChange('name')}
              className={styles.input}
              autoFocus={!photoPreview}
            />

            <label className={styles.label} htmlFor="targetAmount">Target amount (NPR)</label>
            <input
              id="targetAmount"
              type="number"
              min="1"
              placeholder="e.g. 20000"
              value={form.targetAmount}
              onChange={handleChange('targetAmount')}
              className={styles.input}
            />

            <label className={styles.label} htmlFor="deadline">Target date (optional)</label>
            <input
              id="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange('deadline')}
              className={styles.input}
            />

            <div className={styles.buttonRow}>
              <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : (isEditMode ? 'Save changes' : 'Create goal')}
              </button>
            </div>

            {isEditMode && (
              <button type="button" className={styles.deleteLink} onClick={() => setConfirmDelete(true)}>
                <Trash2 size={13} /> Delete this goal
              </button>
            )}
          </form>
        ) : (
          <div>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <p className={styles.confirmText}>
              Are you sure you want to delete <strong>&quot;{goal.name}&quot;</strong>? This can&apos;t be undone.
            </p>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.btnGhost} onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button type="button" className={styles.btnDanger} onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className={styles.spinner} /> : 'Delete goal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}