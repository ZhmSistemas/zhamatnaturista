import Image from 'next/image'

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 py-16">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center mb-6 shadow-sm border border-green-100">
            <Image
              src="https://res.cloudinary.com/difisthcy/image/upload/q_auto/f_auto/v1781990943/favicon_mtltzw.ico"
              alt="Zhamat Natural"
              width={140}
              height={140}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Zhamat <span className='text-green-600'>Natural</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl">
            Bienestar y naturaleza en cada producto
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h2>
          <p className="text-gray-600 leading-relaxed">
            En Zhamat Natural nos dedicamos a ofrecer productos naturales de la más alta calidad, 
            seleccionados cuidadosamente para promover el bienestar integral de nuestras clientas. 
            Creemos en el poder de la naturaleza para transformar vidas, por eso trabajamos con 
            ingredientes y proveedores que comparten nuestra filosofía de respeto y sostenibilidad.
          </p>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros Valores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Naturalidad</h3>
              <p className="text-sm text-gray-500">
                Productos libres de químicos agresivos, respetando los procesos naturales.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Compromiso</h3>
              <p className="text-sm text-gray-500">
                Cada pedido se prepara con dedicación para garantizar tu satisfacción.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Sostenibilidad</h3>
              <p className="text-sm text-gray-500">
                Comprometidos con el medio ambiente y el comercio justo.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contacto</h2>
          <p className="text-gray-600 mb-4">
            ¿Tienes preguntas o quieres saber más sobre nuestros productos?
          </p>
          <a
            href="https://wa.me/573132375369?text=Hola%20Zhamat%20Natural%2C%20quiero%20saber%20más%20sobre%20sus%20productos."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Escríbenos por WhatsApp
          </a>
        </section>
      </div>
    </div>
  )
}
