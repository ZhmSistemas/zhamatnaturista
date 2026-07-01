import ProductoDetalle from '@/components/ProductoDetalle'

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductoDetalle id={id} />
}
