import mongoose from 'mongoose'

export type Brand = {
  _id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
)

const BrandModel = mongoose.models?.Brand || mongoose.model('Brand', BrandSchema)

export default BrandModel
