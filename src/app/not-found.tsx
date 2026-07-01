// app/not-found.jsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-2xl mx-auto animate-fade-in-up">
        {/* Número 404 con estilo moderno */}
        <h1 className="text-9xl md:text-[12rem] font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
          404
        </h1>

        {/* Mensaje principal */}
        <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          ¡Página no encontrada!
        </h2>

        {/* Descripción amigable */}
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg md:text-xl">
          Lo sentimos, la página que buscas no existe o fue movida.
          <br />
          Pero no te preocupes, siempre puedes regresar al inicio.
        </p>

        {/* Botón de acción */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Volver al inicio
          </Link>
        </div>

        {/* Detalle decorativo (opcional) */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          Error 404 • El recurso no está disponible
        </div>
      </div>
    </div>
  );
}