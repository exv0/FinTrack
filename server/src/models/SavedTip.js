import mongoose from 'mongoose'

// Tips themselves are static content defined in the frontend (TIPS array),
// not stored in the database. This model only tracks which tip IDs a given
// user has chosen to save — a simple bookmark relationship.
const savedTipSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipId:  { type: Number, required: true }, // matches the static id in the frontend TIPS array
  },
  { timestamps: true }
)

// A user can only save a given tip once
savedTipSchema.index({ user: 1, tipId: 1 }, { unique: true })

export default mongoose.model('SavedTip', savedTipSchema)