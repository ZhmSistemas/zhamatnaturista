import mongoose from 'mongoose'

export type User = {
  _id: string
  name: string
  email: string
  whatsapp: string
  password: string
  isAdmin: boolean
  isUser: boolean
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    whatsapp: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: { type: Boolean, required: true, default: false },
    isUser: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
)

const UserModel = mongoose.models?.User || mongoose.model('User', UserSchema)

export default UserModel
