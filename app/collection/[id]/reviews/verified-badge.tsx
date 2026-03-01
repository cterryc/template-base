import { FiCheckCircle } from 'react-icons/fi'

export function VerifiedBadge() {
  return (
    <div className='flex items-center space-x-1 text-green-600' title='Compra verificada'>
      <FiCheckCircle className='w-4 h-4' />
      <span className='text-xs font-medium'>Compra verificada</span>
    </div>
  )
}
