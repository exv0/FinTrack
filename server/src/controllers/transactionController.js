import Transaction from '../models/Transaction.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

// GET /api/transactions
export const getTransactions = catchAsync(async (req, res) => {
  const { month, year, type, category } = req.query
  const filter = { user: req.user._id }

  if (type) filter.type = type
  if (category) filter.category = category

  if (month && year) {
    const start = new Date(year, month - 1, 1)
    const end   = new Date(year, month, 0, 23, 59, 59)
    filter.date = { $gte: start, $lte: end }
  }

  const transactions = await Transaction.find(filter).sort({ date: -1 })
  res.json({ success: true, data: transactions })
})

// POST /api/transactions
export const createTransaction = catchAsync(async (req, res) => {
  const transaction = await Transaction.create({ ...req.body, user: req.user._id })
  res.status(201).json({ success: true, data: transaction })
})

// DELETE /api/transactions/:id
export const deleteTransaction = catchAsync(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  })
  if (!transaction) throw new AppError('Transaction not found', 404)
  res.json({ success: true, message: 'Transaction deleted' })
})

// GET /api/transactions/summary — monthly totals grouped by type + category
export const getSummary = catchAsync(async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1
  const year  = Number(req.query.year)  || new Date().getFullYear()

  const start = new Date(year, month - 1, 1)
  const end   = new Date(year, month, 0, 23, 59, 59)

  const summary = await Transaction.aggregate([
    { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
    { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' } } },
  ])

  res.json({ success: true, data: summary })
})

// GET /api/transactions/category-comparison?month=&year=
// Returns each expense category's spend this month vs last month, plus % change —
// feeds the MoM badges (↑23% / ↓5%) on the Spending page.
export const getCategoryComparison = catchAsync(async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1
  const year  = Number(req.query.year)  || new Date().getFullYear()

  const currentStart = new Date(year, month - 1, 1)
  const currentEnd   = new Date(year, month, 0, 23, 59, 59)

  const prevDate = new Date(year, month - 2, 1)
  const prevStart = new Date(prevDate.getFullYear(), prevDate.getMonth(), 1)
  const prevEnd   = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0, 23, 59, 59)

  const [current, previous] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: currentStart, $lte: currentEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
  ])

  const prevMap = Object.fromEntries(previous.map(p => [p._id, p.total]))

  const comparison = current.map(c => {
    const prevTotal = prevMap[c._id] || 0
    let changePct = null
    if (prevTotal > 0) {
      changePct = Math.round(((c.total - prevTotal) / prevTotal) * 100)
    } else if (c.total > 0) {
      changePct = 100 // new category this month, no prior spend to compare against
    }
    return { category: c._id, current: c.total, previous: prevTotal, changePct }
  })

  res.json({ success: true, data: comparison })
})

// GET /api/transactions/monthly-trend?months=5
// Returns income vs expense totals per month for the last N months — feeds the bar chart
export const getMonthlyTrend = catchAsync(async (req, res) => {
  const monthsBack = Number(req.query.months) || 5
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1)

  const trend = await Transaction.aggregate([
    { $match: { user: req.user._id, date: { $gte: start } } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ])

  res.json({ success: true, data: trend })
})