import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/lib/models/UserModel'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(1, 'WhatsApp es obligatorio'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, email, whatsapp, password } = registerSchema.parse(body)

    await dbConnect()

    // Verificar si el email ya existe
    const existingEmail = await UserModel.findOne({ email: email.toLowerCase() })
    if (existingEmail) {
      return Response.json(
        { message: 'Ya existe un usuario con ese email' },
        { status: 409 }
      )
    }

    // Verificar si el whatsapp ya existe
    const existingWhatsapp = await UserModel.findOne({ whatsapp })
    if (existingWhatsapp) {
      return Response.json(
        { message: 'Ya existe un usuario con ese WhatsApp' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new UserModel({
      name,
      email: email.toLowerCase(),
      whatsapp,
      password: hashedPassword,
    })

    await newUser.save()
    return Response.json(
      { message: 'Usuario creado exitosamente' },
      {
        status: 201,
      }
    )
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { message: err },
        { status: 422 }
      )
    }
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      {
        status: 500,
      }
    )
  }
}
