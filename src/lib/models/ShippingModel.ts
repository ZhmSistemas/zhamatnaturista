import mongoose from 'mongoose'

export type ShippingItem = {
  productId: string
  name: string
  price: number
  discount?: number
  image?: string
  quantity: number
}

export type Shipping = {
  _id: string
  userId: string
  nombreCompleto: string
  direccion: string
  ciudad: string
  whatsapp: string
  barrio: string
  items: ShippingItem[]
  subtotal: number
  discount: number
  delivery: number
  total: number
  paymentMethod?: string
  wompiTransactionId?: string
  wompiReference?: string
  wompiStatus?: string
  status?: string
  enviado: boolean
  createdAt: Date
  updatedAt: Date
}

const ShippingItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const ShippingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    nombreCompleto: { type: String, required: true },
    direccion: { type: String, required: true },
    ciudad: { type: String, required: true },
    whatsapp: { type: String, required: true },
    barrio: { type: String, required: true },
    items: [ShippingItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    delivery: { type: Number, default: 12000 },
    total: { type: Number, default: 0 },
    paymentMethod: { type: String },
    wompiTransactionId: { type: String },
    wompiReference: { type: String },
    wompiStatus: { type: String },
    status: { type: String, default: 'pending' },
    enviado: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const ShippingModel = mongoose.models?.Shipping || mongoose.model('Shipping', ShippingSchema)

export default ShippingModel
