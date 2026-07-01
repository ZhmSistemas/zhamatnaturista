import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/lib/models/UserModel'

export const GET = async (request: NextRequest) => {
  try {
    await dbConnect()
    const users = await UserModel.find({}).select('-password').sort({ createdAt: -1 })
    return Response.json(users, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}
