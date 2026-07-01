import mongoose, { Schema } from 'mongoose'

export type Client = {
  _id: string
  establishmentName: string
  contactName: string
  whatsapp?: string
  email: string
  address: string
  createdAt: Date
  updatedAt: Date
}

const ClientSchema = new Schema({
  _id: { type: String, required: true },
  establishmentName: { type: String, required: true },
  contactName: { type: String, required: true },
  whatsapp: { type: String },
  email: { type: String, required: true },
  address: { type: String, required: true },
}, { timestamps: true })

// Eliminar el modelo cacheado para forzar la actualización del esquema
if (mongoose.models.Client) {
  delete mongoose.models.Client
}
const ClientModel = mongoose.model('Client', ClientSchema)

export default ClientModel
