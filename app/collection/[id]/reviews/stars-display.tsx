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
    <div className='flex items-center space-x-0.5'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? 'fill-foreground text-foreground'
              : 'fill-transparent text-foreground/10'
          }`}
          strokeWidth={1}
        />
      ))}
      {showNumber && (
        <span className='text-[10px] font-bold text-foreground/40 ml-2 tracking-tighter'>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
