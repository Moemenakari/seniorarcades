import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

/**
 * Asks ImageKit for a copy no wider than `width` pixels.
 *
 * Photos uploaded from the admin are stored at their original size, often
 * far larger than the card that shows them. ImageKit resizes on the fly
 * when the URL carries a `tr` parameter, and serves WebP or AVIF to
 * browsers that accept them. Other hosts are returned unchanged.
 */
export function sizedImageUrl(src: string | undefined, width: number): string | undefined {
  if (!src || !src.includes('ik.imagekit.io') || /[?&]tr=/.test(src)) return src
  return `${src}${src.includes('?') ? '&' : '?'}tr=w-${Math.round(width)},q-80`
}

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * The widest the image is ever displayed, in CSS pixels. ImageKit images
   * are fetched at twice this, which stays sharp on high-density screens.
   */
  displayWidth?: number
  /**
   * Set on the main image at the top of a page. It loads immediately and
   * first, instead of lazily, because it is what Google times as the
   * page's largest paint.
   */
  priority?: boolean
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, displayWidth, priority, ...rest } = props
  const finalSrc = displayWidth ? sizedImageUrl(src, displayWidth * 2) : src

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'auto' : 'async'}
      {...(priority ? { fetchpriority: 'high' } : {})}
      {...rest}
      onError={handleError}
    />
  )
}
