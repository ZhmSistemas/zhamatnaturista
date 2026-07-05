import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="https://res.cloudinary.com/difisthcy/image/upload/q_auto/f_auto/v1781990943/favicon_mtltzw.ico"
                alt="Zhamat Natural"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="text-lg font-bold text-white">
                Zhamat <span className="text-green-400">Natural</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Bienestar y naturaleza en cada producto. Tu tienda de confianza
              para el cuidado personal y la salud natural.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  Calle 17 No 8 - 37
                  <br />
                  Bogotá, Colombia
                </span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:573132375369" className="hover:text-green-400 transition-colors">
                  313 237 5369
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@zhamatnatural.com" className="hover:text-green-400 transition-colors">
                  info@zhamatnatural.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/573132375369?text=Hola%20Zhamat%20Natural%2C%20quiero%20saber%20más%20sobre%20sus%20productos."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Escríbenos por WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-green-400 transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-green-400 transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="hover:text-green-400 transition-colors">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-white font-semibold mb-4">Horarios</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Lunes - Viernes</span>
                <span className="text-white">8:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sábados</span>
                <span className="text-white">8:00 AM - 2:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Domingos</span>
                <span className="text-white">Cerrado</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Zhamat Natural. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="https://wa.me/573132375369" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
              WhatsApp
            </a>
            <a href="mailto:info@zhamatnatural.com" className="hover:text-green-400 transition-colors">
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
