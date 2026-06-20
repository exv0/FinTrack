import Budget from '../models/Budget.js'
import Transaction from '../models/Transaction.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

// GET /api/budgets?month=&year=
export const getBudgets = catchAsync(async (req, res) => {
  const { month, year } = req.query
  const filter = { user: req.user._id }
  if (month) filter.month = Number(month)
  if (year)  filter.year  = Number(year)

  const budgets = await Budget.find(filter).sort({ category: 1 })
  res.json({ success: true, data: budgets })
})

// GET /api/budgets/with-spend?month=&year=
// Returns each budget alongside actual spend for that category/month — used by the dashboard
export const getBudgetsWithSpend = catchAsync(async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1
  const year  = Number(req.query.year)  || new Date().getFullYear()

  const budgets = await Budget.find({ user: req.user._id, month, year })

  const start = new Date(year, month - 1, 1)
  const end   = new Date(year, month, 0, 23, 59, 59)

  const spendByCategory = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        type: 'expense',
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ])

  const spendMap = Object.fromEntries(spendByCategory.map((s) => [s._id, s.total]))

  const result = budgets.map((b) => ({
    _id: b._id,
    category: b.category,
    limit: b.limit,
    spent: spendMap[b.category] || 0,
    percentUsed: b.limit > 0 ? Math.round(((spendMap[b.category] || 0) / b.limit) * 100) : 0,
  }))

  res.json({ success: true, data: result })
})

// POST /api/budgets
export const createBudget = catchAsync(async (req, res) => {
  const { category, limit, month, year } = req.body

  // Prevent duplicate budgets for the same category/month/year
  const existing = await Budget.findOne({ user: req.user._id, category, month, year })
  if (existing) {
    throw new AppError(`A budget for ${category} already exists for this month`, 400)
  }

  const budget = await Budget.create({ ...req.body, user: req.user._id })
  res.status(201).json({ success: true, data: budget })
})

// PATCH /api/budgets/:id
export const updateBudget = catchAsync(async (req, res) => {
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  )
  if (!budget) throw new AppError('Budget not found', 404)
  res.json({ success: true, data: budget })
})

// DELETE /api/budgets/:id
export const deleteBudget = catchAsync(async (req, res) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  if (!budget) throw new AppError('Budget not found', 404)
  res.json({ success: true, message: 'Budget deleted' })
})