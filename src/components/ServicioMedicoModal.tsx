'use client'

import { useEffect } from 'react'
import { X, Heart, Activity, Brain, Cpu, Stethoscope, TrendingUp, ShieldCheck } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ServicioMedicoModal({ open, onClose }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Servicio de <span className="text-green-600">Medicina Natural</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Intro */}
          <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <p className="text-gray-700 leading-relaxed">
              En <strong>Zhamat Natural</strong> no solo vendemos productos naturales. Somos
              tu <strong>médico naturista de confianza</strong>, comprometidos con tu
              salud y bienestar integral. Utilizamos tecnología de punta e inteligencia
              artificial para brindarte un seguimiento preciso y personalizado.
            </p>
          </div>

          {/* Benefits Grid */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Beneficios de nuestro servicio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Activity,
                  title: 'Toma de Tensión Arterial',
                  desc: 'Monitoreo preciso de tu presión arterial con equipos digitales calibrados. Detectamos a tiempo cualquier anomalía.',
                },
                {
                  icon: TrendingUp,
                  title: 'Glucometría',
                  desc: 'Medición de glucosa en sangre con resultados inmediatos. Ideal para pacientes diabéticos o con factores de riesgo.',
                },
                {
                  icon: Brain,
                  title: 'Seguimiento con IA',
                  desc: 'Nuestro sistema de inteligencia artificial analiza tus mediciones históricas para predecir tendencias y alertar sobre cambios importantes.',
                },
                {
                  icon: Cpu,
                  title: 'Historial Digital',
                  desc: 'Tus registros médicos se almacenan de forma segura. Puedes consultar tu evolución en cualquier momento.',
                },
                {
                  icon: Stethoscope,
                  title: 'Asesoría Naturista',
                  desc: 'Te recomendamos productos naturales y hábitos saludables basados en tus resultados y necesidades específicas.',
                },
                {
                  icon: Heart,
                  title: 'Bienestar Integral',
                  desc: 'Abordamos tu salud de manera holística: alimentación, ejercicio, manejo del estrés y suplementación natural.',
                },
              ].map((benefit, i) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={i}
                    className="flex gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-green-200 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gray-900 rounded-2xl p-6 text-center">
            <p className="text-white text-lg font-bold mb-2">¿Listo para cuidar tu salud?</p>
            <p className="text-gray-400 text-sm mb-5">
              Contáctanos y agenda tu primera valoración naturista
            </p>
            <a
              href="https://wa.me/573132375369?text=Hola%20Zhamat%20Natural%2C%20quiero%20agendar%20una%20valoración%20naturista."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Agendar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
