import express from 'express'
import { getSavedTips, saveTip, unsaveTip } from '../controllers/savedTipController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/',           protect, getSavedTips)
router.post('/',          protect, saveTip)
router.delete('/:tipId',  protect, unsaveTip)

export default router