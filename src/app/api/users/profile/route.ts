import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/lib/models/UserModel'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return Response.json({ message: 'No autorizado' }, { status: 401 })
  }

  try {
    await dbConnect()

    const user = await UserModel.findById(session.user.id).select('-password')

    if (!user) {
      return Response.json({ message: 'Usuario no encontrado' }, { status: 404 })
    }

    return Response.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      whatsapp: user.whatsapp,
      isAdmin: user.isAdmin,
      isUser: user.isUser,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return Response.json({ message: 'Error al obtener datos del usuario' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return Response.json({ message: 'No autorizado' }, { status: 401 })
  }

  try {
    await dbConnect()

    const body = await request.json()
    const { email, whatsapp, currentPassword, newPassword } = body

    const user = await UserModel.findById(session.user.id)

    if (!user) {
      return Response.json({ message: 'Usuario no encontrado' }, { status: 404 })
    }

    // Validar si se intenta cambiar la contraseña
    if (newPassword) {
      if (!currentPassword) {
        return Response.json(
          { message: 'Debe proporcionar la contraseña actual' },
          { status: 400 }
        )
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password)

      if (!validPassword) {
        return Response.json(
          { message: 'La contraseña actual es incorrecta' },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      user.password = hashedPassword
    }

    // Validar si se intenta cambiar el email
    if (email && email !== user.email) {
      const existingUser = await UserModel.findOne({ email })
      if (existingUser) {
        return Response.json(
          { message: 'El correo ya está registrado' },
          { status: 400 }
        )
      }
      user.email = email
    }

    // Validar si se intenta cambiar el whatsapp
    if (whatsapp && whatsapp !== user.whatsapp) {
      const existingUser = await UserModel.findOne({ whatsapp })
      if (existingUser) {
        return Response.json(
          { message: 'El número de WhatsApp ya está registrado' },
          { status: 400 }
        )
      }
      user.whatsapp = whatsapp
    }

    await user.save()

    return Response.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        isAdmin: user.isAdmin,
        isUser: user.isUser,
      },
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return Response.json({ message: 'Error al actualizar el perfil' }, { status: 500 })
  }
}
