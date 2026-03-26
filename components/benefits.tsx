import {
  Truck,
  HeadphonesIcon,
  ShieldCheck,
  // CreditCard,
  // Clock,
  Sparkles
} from 'lucide-react'

const benefits = [
  {
    icon: Truck,
    title: 'Envío Gratis',
    description: 'En órdenes superiores a S/ 150.00',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: HeadphonesIcon,
    title: 'Soporte 24/7',
    description: 'Asistencia personalizada en tu pedido',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    icon: ShieldCheck,
    title: 'Pago Seguro',
    description: 'Transacciones 100% seguras',
    gradient: 'from-green-500/20 to-emerald-500/20'
  }
]

export default function Benefits() {
  return (
    <section className='py-16 md:py-24 bg-gradient-to-b from-background to-muted/20'>
      <div className='max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12'>
        {/* Header de la sección */}
        <div className='text-center mb-12 md:mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700'>
            <Sparkles className='w-4 h-4' />
            <span>Beneficios Exclusivos</span>
          </div>
          <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100'>
            ¿Por qué elegirnos?
          </h2>
          <p className='text-muted-foreground mt-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200'>
            Ofrecemos la mejor experiencia de compra con beneficios diseñados
            para ti
          </p>
        </div>

        {/* Grid de beneficios */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'>
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className='group relative flex flex-col items-center text-center p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 animate-in fade-in zoom-in duration-700'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Fondo gradiente decorativo */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Icono con efecto moderno */}
              <div className='relative'>
                <div className='absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
                <div className='relative w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 mb-6'>
                  <benefit.icon className='h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300' />
                </div>
              </div>

              {/* Contenido */}
              <h3 className='text-lg md:text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300'>
                {benefit.title}
              </h3>
              <p className='text-sm text-muted-foreground max-w-xs mx-auto'>
                {benefit.description}
              </p>

              {/* Línea decorativa al hover */}
              <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-12 transition-all duration-300' />
            </div>
          ))}
        </div>

        {/* Estadísticas adicionales */}
        <div className='mt-16 pt-8 border-t border-border'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
            {[
              { value: '5000+', label: 'Clientes Felices', icon: '😊' },
              { value: '50+', label: 'Marcas Exclusivas', icon: '✨' },
              { value: '24/7', label: 'Soporte Activo', icon: '💬' },
              { value: '100%', label: 'Seguridad Garantizada', icon: '🔒' }
            ].map((stat, idx) => (
              <div key={idx} className='group'>
                <div className='text-2xl md:text-3xl font-bold text-primary mb-1'>
                  {stat.value}
                </div>
                <div className='text-xs text-muted-foreground uppercase tracking-wider'>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
