import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import InvoiceModel from '@/lib/models/InvoiceModel'

export const GET = async (request: NextRequest) => {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientWhatsapp = searchParams.get('clientWhatsapp')

    const query: Record<string, string> = {}
    if (status && status !== 'all') {
      query.status = status
    }
    if (clientWhatsapp) {
      query.clientWhatsapp = clientWhatsapp
    }

    const invoices = await InvoiceModel.find(query).sort({ createdAt: -1 })
    return Response.json(invoices, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { imageUrl, invoiceNumber, customerName, clientWhatsapp, invoiceDate, items, discount, payments } = body

    if (!invoiceNumber || !customerName || !clientWhatsapp || !items || items.length === 0) {
      return Response.json(
        { message: 'Número de factura, cliente, WhatsApp e items son obligatorios' },
        { status: 422 }
      )
    }

    await dbConnect()

    const existingInvoice = await InvoiceModel.findOne({ invoiceNumber })
    if (existingInvoice) {
      return Response.json(
        { message: 'Ya existe una factura con ese número' },
        { status: 409 }
      )
    }

    const subtotal = items.reduce((acc: number, item: { subtotal: number }) => acc + item.subtotal, 0)
    const discountAmount = Number(discount) || 0
    const total = Math.max(0, subtotal - discountAmount)
    const paidAmount = payments ? payments.reduce((acc: number, p: { amount: number }) => acc + p.amount, 0) : 0
    const balance = total - paidAmount
    const status = balance <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'pending'

    const newInvoice = new InvoiceModel({
      invoiceNumber,
      customerName,
      clientWhatsapp,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
      items,
      subtotal,
      discount: discountAmount,
      total,
      payments: payments || [],
      paidAmount,
      balance,
      status,
      image: imageUrl,
    })

    await newInvoice.save()
    return Response.json(
      { message: 'Factura creada exitosamente', invoice: newInvoice },
      { status: 201 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}
