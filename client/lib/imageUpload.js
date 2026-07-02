const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

/**
 * Converts a File object to a base64 data URI string.
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Opens a file picker dialog restricted to images.
 * Returns a Promise that resolves to the selected File, or null if cancelled.
 */
export function pickImageFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp,image/gif'
    input.onchange = () => resolve(input.files?.[0] ?? null)
    input.oncancel = () => resolve(null)
    input.click()
  })
}

/**
 * Validates an image file for type and size.
 * Returns null if valid, or an error string if not.
 */
export function validateImageFile(file) {
  if (!file) return 'No file selected.'
  if (!file.type.startsWith('image/')) return 'Please select an image file (JPEG, PNG, WebP, or GIF).'
  if (file.size > MAX_SIZE_BYTES) return `Image must be under 2MB. This file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`
  return null
}

/**
 * Full pick → validate → convert pipeline.
 * Returns { base64, error } — one will be null and the other set.
 */
export async function pickAndConvertImage() {
  try {
    const file = await pickImageFile()
    if (!file) return { base64: null, error: null } // user cancelled — not an error

    const validationError = validateImageFile(file)
    if (validationError) return { base64: null, error: validationError }

    const base64 = await fileToBase64(file)
    return { base64, error: null }
  } catch {
    return { base64: null, error: 'Could not read the selected file. Please try again.' }
  }
}