import { FiCheckCircle } from 'react-icons/fi'

export function VerifiedBadge() {
  return (
    <div
      className='flex items-center space-x-1.5 text-foreground/40 bg-secondary px-2 py-0.5 rounded-sm'
      title='Compra verificada'
    >
      <FiCheckCircle className='w-3 h-3' />
      <span className='text-[10px] uppercase tracking-widest font-bold'>
        Verificado
      </span>
    </div>
  )
}
