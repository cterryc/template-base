import { Truck, HeadphonesIcon, ShieldCheck } from 'lucide-react'
import styles from './benefits.module.css'

const benefits = [
  {
    icon: Truck,
    title: 'Envio Gratis',
    description: 'En Ordenes Superiores a S/ 150.00'
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Soporte',
    description: 'Asistencia en tu Pedido'
  },
  {
    icon: ShieldCheck,
    title: 'Pago Seguro',
    description: 'Transacciones 100% seguras'
  }
]

export default function Benefits() {
  return (
    <section className={styles.section}>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {benefits.map((benefit, index) => (
          <div key={index} className='flex flex-col items-center text-center'>
            <benefit.icon className='h-12 w-12 mb-4 text-primary' />
            <h3 className='text-xl font-semibold mb-2'>{benefit.title}</h3>
            <p className='text-gray-600'>{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
