export default function ProductDetailLoading() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
        {/* Skeleton imágenes */}
        <div className='space-y-4'>
          <div className='w-full aspect-square bg-muted animate-pulse rounded-lg' />
          <div className='w-full aspect-video bg-muted animate-pulse rounded-lg' />
        </div>

        {/* Skeleton información */}
        <div className='space-y-4'>
          <div className='h-10 w-3/4 bg-muted animate-pulse rounded' />
          <div className='h-8 w-1/2 bg-muted animate-pulse rounded' />
          <div className='h-6 w-1/3 bg-muted animate-pulse rounded' />
          <div className='h-20 w-full bg-muted animate-pulse rounded' />
          <div className='h-12 w-full bg-muted animate-pulse rounded' />
        </div>
      </div>

      {/* Skeleton relacionados */}
      <div className='space-y-4'>
        <div className='h-8 w-48 bg-muted animate-pulse rounded' />
        <div className='grid grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='aspect-square bg-muted animate-pulse rounded' />
          ))}
        </div>
      </div>
    </div>
  )
}
