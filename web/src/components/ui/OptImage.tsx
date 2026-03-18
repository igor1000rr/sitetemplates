import Image from 'next/image'

interface Props {
  src?: string | null
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

/**
 * Optimized Image wrapper with next/Image.
 * Handles external S3 URLs and missing images gracefully.
 */
export default function OptImage({ src, alt, width, height, className, priority, fill, sizes }: Props) {
  if (!src) return null

  // For fill mode
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        className={className}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 500}
      className={className}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px'}
    />
  )
}
