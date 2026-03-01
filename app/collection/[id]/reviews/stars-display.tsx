import { Star } from 'lucide-react'

interface StarsDisplayProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
}

export function StarsDisplay({ 
  rating, 
  size = 'md',
  showNumber = true 
}: StarsDisplayProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className='flex items-center space-x-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
      {showNumber && (
        <span className='text-sm text-muted-foreground ml-1'>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  )
}
