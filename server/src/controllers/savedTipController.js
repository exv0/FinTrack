import SavedTip from '../models/SavedTip.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

// GET /api/saved-tips — returns array of tipIds the user has saved
export const getSavedTips = catchAsync(async (req, res) => {
  const saved = await SavedTip.find({ user: req.user._id })
  res.json({ success: true, data: saved.map((s) => s.tipId) })
})

// POST /api/saved-tips — body: { tipId }
export const saveTip = catchAsync(async (req, res) => {
  const { tipId } = req.body
  if (typeof tipId !== 'number') {
    throw new AppError('tipId must be a number', 400)
  }

  // Avoid duplicate-key errors if the tip is already saved — just no-op
  const existing = await SavedTip.findOne({ user: req.user._id, tipId })
  if (existing) {
    return res.json({ success: true, data: existing })
  }

  const saved = await SavedTip.create({ user: req.user._id, tipId })
  res.status(201).json({ success: true, data: saved })
})

// DELETE /api/saved-tips/:tipId
export const unsaveTip = catchAsync(async (req, res) => {
  const tipId = Number(req.params.tipId)
  await SavedTip.findOneAndDelete({ user: req.user._id, tipId })
  res.json({ success: true, message: 'Tip unsaved' })
})