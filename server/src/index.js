import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from '../config/db.js'
import AppError from './utils/AppError.js'
import errorHandler from './middleware/errorHandler.js'

import authRoutes        from './routes/auth.js'
import transactionRoutes from './routes/transactions.js'
import goalRoutes        from './routes/goals.js'
import budgetRoutes      from './routes/budgets.js'
import savedTipRoutes    from './routes/savedTips.js'

const app = express()

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',         authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/goals',        goalRoutes)
app.use('/api/budgets',      budgetRoutes)
app.use('/api/saved-tips',   savedTipRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV })
})

// 404 — forward to error handler as a proper AppError
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404))
})

// Centralized error handler — must be last
app.use(errorHandler)

// ── Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
})

// Catch unhandled promise rejections so the process doesn't silently hang
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message)
})